import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import { faker } from '@faker-js/faker';
import { Wallet, Landmark, CreditCard, University } from 'lucide-react';

const cajaIconMap = {
  'Efectivo': Wallet,
  'Cuenta Bancaria': Landmark,
  'Tarjeta de Crédito': CreditCard,
  'Préstamos': University,
};

export const useStore = create((set, get) => ({
  // State
  session: null,
  family: null,
  familyMembers: [],
  members: [],
  transactions: [],
  cajas: [],
  budgets: [],
  scheduledExpenses: [],
  categories: [],
  loading: true,
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth(),

  // Actions
  setSession: (session) => set({ session }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),

  clearData: () => set({
    family: null,
    familyMembers: [],
    members: [],
    transactions: [],
    cajas: [],
    budgets: [],
    scheduledExpenses: [],
    categories: [],
    loading: false,
  }),

  fetchInitialData: async (user) => {
    if (!user) {
      get().clearData();
      return;
    }
    set({ loading: true });

    try {
      // 1. Check for family entry
      const { data: familyMemberEntry, error: familyError } = await supabase
        .from('family_members')
        .select('*, families(*)')
        .eq('user_id', user.id)
        .maybeSingle();

      // Handle network errors or other DB errors during the first fetch
      if (familyError) {
        console.error("Error fetching family:", familyError);
        set({ loading: false }); // Stop on definitive error
        return;
      }

      // Handle case where user is new and setup is not yet complete
      if (!familyMemberEntry || !familyMemberEntry.families) {
        console.log("Family data not ready, retrying in 2 seconds...");
        setTimeout(() => get().fetchInitialData(user), 2000); // Retry
        return; // Keep loading state as is and exit
      }

      // 2. Family found, proceed to fetch all related data
      const userFamily = familyMemberEntry.families;
      const familyId = userFamily.id;

      const [
        { data: finalFamilyMembers, error: familyMembersError },
        { data: finalMembers, error: membersError },
        { data: finalCajas, error: cajasError },
        { data: finalTransactions, error: transactionsError },
        { data: finalBudgets, error: budgetsError },
        { data: finalScheduled, error: scheduledError },
        { data: finalCategories, error: categoriesError }
      ] = await Promise.all([
        supabase.from('family_members').select('*, user_profiles:user_id(*)').eq('family_id', familyId),
        supabase.from('members').select('*').eq('family_id', familyId),
        supabase.from('cajas').select('*').eq('family_id', familyId),
        supabase.from('transactions').select('*, members(name, avatar)').eq('family_id', familyId).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('family_id', familyId),
        supabase.from('scheduled_expenses').select('*').eq('family_id', familyId),
        supabase.from('categories').select('*').eq('family_id', familyId)
      ]);
      
      const errors = { familyMembersError, membersError, cajasError, transactionsError, budgetsError, scheduledError, categoriesError };
      const hasError = Object.values(errors).some(e => e !== null);

      if (hasError) {
        console.error("Error loading one or more family data sets:", errors);
        set({ loading: false });
        return;
      }

      // 3. All data fetched successfully, update the state
      set({
        family: userFamily,
        familyMembers: finalFamilyMembers || [],
        members: finalMembers || [],
        transactions: (finalTransactions || []).map(t => ({
          ...t,
          memberName: t.members?.name || 'N/A',
          memberAvatar: t.members?.avatar
        })),
        cajas: (finalCajas || []).map(c => ({ ...c, icon: cajaIconMap[c.type] })),
        budgets: finalBudgets || [],
        scheduledExpenses: finalScheduled || [],
        categories: finalCategories || [],
        loading: false, // Set loading to false here, on success
      });

    } catch (error) {
      console.error("Critical error in fetchInitialData:", error);
      set({ loading: false }); // Stop on unexpected errors
    }
  },

  addTransactions: async (newTransactions, isTransfer = false, transferId = null) => {
    const familyId = get().family?.id;
    if (!familyId) return console.error("No family context");

    const transactionsToAdd = Array.isArray(newTransactions) ? newTransactions : [newTransactions];
    
    const supabaseTransactions = transactionsToAdd.map(t => ({
      date: t.date,
      description: t.description,
      member_id: t.memberId || null,
      caja_id: t.cajaId || null,
      type: t.type,
      category: t.category,
      amount: t.amount,
      transfer_id: isTransfer ? transferId : null,
      family_id: familyId,
    }));

    const { data, error } = await supabase.from('transactions').insert(supabaseTransactions).select('*, members(name, avatar)');

    if (error) {
      console.error('Error adding transactions:', error);
    } else {
      const newTxsWithDetails = (data || []).map(tx => ({
          ...tx,
          memberName: tx.members?.name || 'N/A',
          memberAvatar: tx.members?.avatar
      }));
      set(state => ({
        transactions: [...newTxsWithDetails, ...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
      }));
    }
  },

  updateTransaction: async (transactionId, updatedData) => {
    if (updatedData.isTransferEdit) {
      const { originalTransferId, newTransactions } = updatedData;
  
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('transfer_id', originalTransferId);
  
      if (deleteError) {
        console.error('Error deleting old transfer during update:', deleteError);
        return;
      }
  
      set(state => ({ transactions: state.transactions.filter(t => t.transfer_id !== originalTransferId) }));
  
      await get().addTransactions(newTransactions, true, originalTransferId);
  
    } else {
      const supabaseData = {
        date: updatedData.date,
        description: updatedData.description,
        member_id: updatedData.memberId || null,
        caja_id: updatedData.cajaId || null,
        type: updatedData.type,
        category: updatedData.category,
        amount: updatedData.amount
      };
    
      const { data, error } = await supabase
        .from('transactions')
        .update(supabaseData)
        .eq('id', transactionId)
        .select('*, members(name, avatar)');
    
      if (error) {
        console.error('Error updating transaction:', error);
      } else if (data && data.length > 0) {
        const updatedTx = data[0];
        set(state => ({
          transactions: state.transactions.map(t => 
            t.id === transactionId 
            ? { ...updatedTx, memberName: updatedTx.members?.name || 'N/A', memberAvatar: updatedTx.members?.avatar } 
            : t
          )
        }));
      }
    }
  },

  deleteTransaction: async (transaction) => {
    if (transaction.transfer_id) {
      const { error } = await supabase.from('transactions').delete().eq('transfer_id', transaction.transfer_id);
      if (error) console.error('Error deleting transfer:', error);
      else set(state => ({ transactions: state.transactions.filter(t => t.transfer_id !== transaction.transfer_id) }));
    } else {
      const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
      if (error) console.error('Error deleting transaction:', error);
      else set(state => ({ transactions: state.transactions.filter(t => t.id !== transaction.id) }));
    }
  },

  addCaja: async (newCajaData) => {
    const familyId = get().family?.id;
    if (!familyId) return console.error("No family context");

    const supabaseData = { ...newCajaData, family_id: familyId };
    Object.keys(supabaseData).forEach(key => {
      if (supabaseData[key] === undefined || supabaseData[key] === '') delete supabaseData[key];
    });

    const { data, error } = await supabase.from('cajas').insert([supabaseData]).select();
    
    if (error) {
      console.error('Error adding caja:', error);
    } else if (data && data.length > 0) {
      const newCaja = data[0];
      const newCajaWithIcon = { ...newCaja, icon: cajaIconMap[newCaja.type] };
      set(state => ({ cajas: [...state.cajas, newCajaWithIcon] }));

      if (newCaja.type === 'Préstamos' || newCaja.type === 'Tarjeta de Crédito') {
        const isLoan = newCaja.type === 'Préstamos';
        const newExpenseData = {
          description: isLoan ? `Cuota de ${newCaja.name}` : `Pago de Tarjeta ${newCaja.name}`,
          amount: isLoan ? parseFloat(newCaja.monthly_payment) || 0 : 0,
          category: isLoan ? 'Vivienda' : 'Servicios',
          day_of_month: isLoan ? parseInt(newCaja.payment_day) || 1 : parseInt(newCaja.payment_due_date) || 1,
          member_id: newCaja.member_id,
          caja_id: null,
          is_automatic: true,
          is_credit_card_payment: !isLoan,
          credit_card_id: isLoan ? null : newCaja.id,
        };
        await get().addScheduledExpense(newExpenseData);
      }
    }
  },
  
  saveBudget: async (newBudget) => {
    const familyId = get().family?.id;
    if (!familyId) return console.error("No family context");

    const budgetToSave = { ...newBudget, family_id: familyId };
    const { data, error } = await supabase.from('budgets').upsert(budgetToSave, { onConflict: 'family_id,category,month,year' }).select();
    
    if (error) {
      console.error('Error saving budget:', error);
    } else if (data && data.length > 0) {
      set(state => {
        const existingIndex = state.budgets.findIndex(b => b.category === newBudget.category && b.month === newBudget.month && b.year === newBudget.year);
        if (existingIndex > -1) {
          const updatedBudgets = [...state.budgets];
          updatedBudgets[existingIndex] = data[0];
          return { budgets: updatedBudgets };
        }
        return { budgets: [...state.budgets, data[0]] };
      });
    }
  },

  deleteBudget: async (budgetId) => {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
    if (error) console.error('Error deleting budget:', error);
    else set(state => ({ budgets: state.budgets.filter(b => b.id !== budgetId) }));
  },

  addScheduledExpense: async (newExpenseData) => {
    const familyId = get().family?.id;
    if (!familyId) return console.error("No family context");

    const supabaseData = { ...newExpenseData, family_id: familyId };
    const { data, error } = await supabase.from('scheduled_expenses').insert([supabaseData]).select();
    if (error) console.error('Error adding scheduled expense:', error);
    else if (data?.[0]) set(state => ({ scheduledExpenses: [...state.scheduledExpenses, data[0]] }));
  },

  addMember: async (newMemberData) => {
    const familyId = get().family?.id;
    if (!familyId) return console.error("No family context");

    const newMember = { ...newMemberData, avatar: faker.image.avatar(), family_id: familyId };
    const { data, error } = await supabase.from('members').insert([newMember]).select();
    if (error) {
      console.error('Error adding member:', error);
    } else if (data?.[0]) {
      const newlyAddedMember = data[0];
      set(state => ({ members: [...state.members, newlyAddedMember] }));

      const newCashBox = { name: `Efectivo ${newlyAddedMember.name.split(' ')[0]}`, type: 'Efectivo', member_id: newlyAddedMember.id, family_id: familyId };
      const { data: cajaData, error: cajaError } = await supabase.from('cajas').insert([newCashBox]).select();
      if (cajaError) console.error('Error creating default cash box:', cajaError);
      else if (cajaData?.[0]) {
        const newCajaWithIcon = { ...cajaData[0], icon: cajaIconMap[cajaData[0].type] };
        set(state => ({ cajas: [...state.cajas, newCajaWithIcon] }));
      }
    }
  },

  deleteMember: async (memberId) => {
    const { error: cajasError } = await supabase.from('cajas').delete().eq('member_id', memberId);
    if (cajasError) return console.error("Error deleting member's cash boxes:", cajasError);

    const { error: memberError } = await supabase.from('members').delete().eq('id', memberId);
    if (memberError) return console.error('Error deleting member:', memberError);

    set(state => ({
      members: state.members.filter(m => m.id !== memberId),
      cajas: state.cajas.filter(c => c.member_id !== memberId),
      transactions: state.transactions.map(t => t.member_id === memberId ? { ...t, member_id: null, memberName: 'Eliminado' } : t),
    }));
  },

  addCategory: async (categoryData) => {
    const familyId = get().family?.id;
    if (!familyId) return console.error("No family context");

    const categoryToSave = { ...categoryData, family_id: familyId };
    const { data, error } = await supabase.from('categories').insert([categoryToSave]).select();
    if (error) console.error('Error adding category:', error);
    else if (data?.[0]) set(state => ({ categories: [...state.categories, data[0]] }));
  },

  deleteCategory: async (categoryId) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) console.error('Error deleting category:', error);
    else set(state => ({ categories: state.categories.filter(c => c.id !== categoryId) }));
  },

  updateMemberAvatar: async (memberId, newAvatar) => {
    const { data, error } = await supabase.from('members').update({ avatar: newAvatar }).eq('id', memberId).select();
    if (error) console.error('Error updating avatar:', error);
    else if (data?.[0]) set(state => ({ members: state.members.map(m => m.id === memberId ? data[0] : m) }));
  },

  confirmScheduledExpense: async (updatedTransactionData, scheduledExpenseId) => {
    const newTransaction = { ...updatedTransactionData, type: 'Gasto' };
    await get().addTransactions([newTransaction]);

    const today = new Date();
    const periodKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const scheduledExpense = get().scheduledExpenses.find(e => e.id === scheduledExpenseId);
    const updatedConfirmedMonths = [...(scheduledExpense.confirmed_months || []), periodKey];

    const { error } = await supabase.from('scheduled_expenses').update({ confirmed_months: updatedConfirmedMonths }).eq('id', scheduledExpenseId);
    if (error) {
      console.error('Error updating scheduled expense:', error);
    } else {
      set(state => ({
        scheduledExpenses: state.scheduledExpenses.map(exp => exp.id === scheduledExpenseId ? { ...exp, confirmed_months: updatedConfirmedMonths } : exp)
      }));
    }
  },

  updateFamilyMemberRole: async (memberId, newRole) => {
    const { data, error } = await supabase.from('family_members').update({ role: newRole }).eq('id', memberId).select().single();
    if (error) {
      console.error('Error updating member role:', error);
      alert(`Error: ${error.message}`);
    } else if (data) {
      set(state => ({ familyMembers: state.familyMembers.map(m => m.id === memberId ? { ...m, role: data.role } : m) }));
    }
  },

  deleteFamilyMember: async (memberId) => {
    const family = get().family;
    const memberToDelete = get().familyMembers.find(m => m.id === memberId);
    if (!memberToDelete || memberToDelete.user_id === family?.owner_id) {
      alert("No se puede eliminar al propietario de la familia.");
      return;
    }

    const { error } = await supabase.from('family_members').delete().eq('id', memberId);
    if (error) {
      console.error('Error deleting family member:', error);
      alert(`Error: ${error.message}`);
    } else {
      set(state => ({ familyMembers: state.familyMembers.filter(m => m.id !== memberId) }));
    }
  },
}));
