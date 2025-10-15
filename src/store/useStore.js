import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import { Wallet, Landmark, CreditCard, University } from 'lucide-react';
import { format } from 'date-fns';

const cajaIconMap = {
  'Efectivo': Wallet,
  'Cuenta Bancaria': Landmark,
  'Tarjeta de Crédito': CreditCard,
  'Préstamos': University,
};

export const useStore = create((set, get) => ({
  session: null,
  family: null,
  members: [],
  transactions: [],
  cajas: [],
  budgets: [],
  scheduledExpenses: [],
  categories: [],
  loading: true,
  error: null,
  errorMessage: null,
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth(),

  setSession: (session) => set({ session }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),

  fetchInitialData: async () => {
    set({ loading: true, error: null, errorMessage: null });
    const { session } = get();
    if (!session) {
      set({ loading: false });
      return;
    }

    try {
      let familyId;

      // Step 1: Check if user belongs to a family.
      const { data: familyMemberData, error: familyMemberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', session.user.id)
        .single();

      // If no family member record, it's a new user.
      if (familyMemberError && familyMemberError.code === 'PGRST116') {
        // Step 1.1: Try to accept an invitation.
        const { error: rpcError } = await supabase.rpc('accept_invitation');
        if (rpcError) {
          console.error("Error accepting invitation:", rpcError);
        }

        // Step 1.2: Re-check for family membership after trying to accept.
        const { data: updatedFamilyMemberData, error: updatedFamilyMemberError } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', session.user.id)
          .single();
        
        // If still no family, they are a creator and need to go to setup.
        if (updatedFamilyMemberError) {
          console.log("New user without invitation detected. Redirecting to setup.");
          set({ loading: false, family: null });
          return;
        }

        // If they now have a family, proceed with the new family ID.
        familyId = updatedFamilyMemberData.family_id;

      } else if (familyMemberError) {
        // Any other error during the initial check is a problem.
        throw familyMemberError;
      } else {
        // User already belongs to a family.
        familyId = familyMemberData.family_id;
      }

      // Step 2: Fetch all data in parallel now that we have a family ID.
      const dataSources = {
        family: supabase.from('families').select('*').eq('id', familyId).single(),
        members: supabase.from('family_members_view').select('user_id, role, full_name, avatar_url').eq('family_id', familyId),
        transactions: supabase.from('transactions').select('id, date, description, member_id, caja_id, type, category, amount, transfer_id').eq('family_id', familyId),
        cajas: supabase.from('cajas').select('id, type, name, bank, account_number, currency, card_number, credit_line, closing_day, payment_due_date, loan_purpose, total_installments, paid_installments, payment_day, monthly_payment, member_id').eq('family_id', familyId),
        budgets: supabase.from('budgets').select('id, category, limit_amount, year, month').eq('family_id', familyId),
        scheduledExpenses: supabase.from('scheduled_expenses').select('id, description, amount, category, day_of_month, member_id, caja_id, confirmed_months, is_automatic, is_credit_card_payment, credit_card_id').eq('family_id', familyId),
        categories: supabase.from('categories').select('id, name, type, icon_name').eq('family_id', familyId),
      };
      
      const results = await Promise.all(Object.values(dataSources).map(query => query));
      const [familyResult, membersResult, transactionsResult, cajasResult, budgetsResult, scheduledExpensesResult, categoriesResult] = results;

      if (familyResult.error) throw new Error(`Error fetching family: ${familyResult.error.message}`);
      // ... check other errors if necessary

      const formattedMembers = membersResult.data.map(m => ({
        id: m.user_id,
        role: m.role,
        name: m.full_name,
        avatar: m.avatar_url || `https://i.pravatar.cc/150?u=${m.user_id}`,
      }));

      const memberMap = new Map(formattedMembers.map(m => [m.id, m]));
      const transactionsWithDetails = transactionsResult.data.map(t => ({
        ...t,
        memberName: memberMap.get(t.member_id)?.name || 'N/A',
        memberAvatar: memberMap.get(t.member_id)?.avatar,
      })).sort((a, b) => new Date(b.date) - new Date(a.date));

      set({
        family: familyResult.data,
        members: formattedMembers,
        transactions: transactionsWithDetails,
        cajas: cajasResult.data.map(c => ({...c, icon: cajaIconMap[c.type]})),
        budgets: budgetsResult.data,
        scheduledExpenses: scheduledExpensesResult.data,
        categories: categoriesResult.data,
        loading: false,
      });

    } catch (error) {
      console.error("Critical Error during fetchInitialData:", error);
      const errorMessage = error.message || '';
      const errorCode = error.code || '';
      
      if (errorMessage.includes('oauth_client_id') || errorCode === 'refresh_token_not_found' || errorCode === 'unexpected_failure') {
        set({ error: 'AUTH_SESSION_ERROR', loading: false });
        setTimeout(() => supabase.auth.signOut(), 500);
      } else if (errorMessage.includes('timeout')) {
        const problemSource = error.details?.match(/'([^']+)'/)?.[1] || 'desconocida';
        set({ error: 'DATABASE_TIMEOUT_ERROR', errorMessage: `Timeout en la consulta a '${problemSource}'`, loading: false });
      } else if (errorMessage.includes('recursion') || error.code === '54001' || error.code === '42P17') {
        const problemSource = error.details?.match(/'([^']+)'/)?.[1] || 'desconocida';
        set({ error: 'DATABASE_RECURSION_ERROR', errorMessage: `Recursión en la tabla/vista '${problemSource}'`, loading: false });
      } else if (errorMessage.includes('Failed to fetch')) {
         set({ error: 'NETWORK_ERROR', loading: false });
      } else {
         set({ error: 'GENERIC_ERROR', errorMessage: errorMessage, loading: false });
      }
    }
  },

  setupFamilyAndInviteMembers: async (familyName, emails) => {
    set({ loading: true, error: null, errorMessage: null });
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado.");

        // 1. Create the family
        const { data: newFamily, error: familyError } = await supabase
            .from('families')
            .insert({ name: familyName, owner_id: user.id })
            .select()
            .single();
        if (familyError) throw new Error(`Error creando la familia: ${familyError.message}`);

        // 2. Link the creator to the family
        const { error: memberError } = await supabase.from('family_members').insert({
            family_id: newFamily.id,
            user_id: user.id,
            role: 'Aportante Principal'
        });
        if (memberError) throw new Error(`Error asignando el rol: ${memberError.message}`);

        // 3. Create invitations for other members
        if (emails.length > 0) {
            const invitations = emails.map(email => ({
                family_id: newFamily.id,
                email: email,
                role: 'Aportante'
            }));
            const { error: inviteError } = await supabase.from('invitations').insert(invitations);
            if (inviteError) {
                console.warn("Error creando invitaciones:", inviteError);
            }
        }
        
        // 4. Success, refetch all data. The app will redirect automatically.
        await get().fetchInitialData();
        return { success: true };

    } catch (error) {
        console.error("Error during family setup:", error);
        set({ loading: false, error: 'SETUP_ERROR', errorMessage: error.message });
        return { error };
    }
  },

  clearData: () => {
    set({
      family: null, members: [], transactions: [], cajas: [],
      budgets: [], scheduledExpenses: [], categories: [], loading: false, error: null, errorMessage: null
    });
  },

  inviteMember: async ({ email, role }) => {
    const { family } = get();
    if (!family) {
      return { error: { message: "No se encontró la familia para asociar la invitación." } };
    }

    const { data, error } = await supabase.from('invitations').insert([
        { family_id: family.id, email, role }
    ]);
    
    if (error) {
      console.error('Error creating invitation:', error);
    }
    
    return { data, error };
  },

  addTransactions: async (newTransactions, isTransfer = false, transferId = null) => {
    const { family } = get();
    const transactionsToAdd = newTransactions.map(t => ({
      ...t,
      family_id: family.id,
      transfer_id: isTransfer ? transferId : null
    }));

    const { data, error } = await supabase.from('transactions').insert(transactionsToAdd).select();
    if (error) {
      console.error('Error adding transactions:', error);
      return;
    }
    get().fetchInitialData();
  },

  updateTransaction: async (transactionId, updatedData) => {
    const { error } = await supabase.from('transactions').update(updatedData).eq('id', transactionId);
    if (error) {
      console.error('Error updating transaction:', error);
      return;
    }
    get().fetchInitialData();
  },

  deleteTransaction: async (transactionToDelete) => {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionToDelete.id);
    if (error) {
      console.error('Error deleting transaction:', error);
      return;
    }
    get().fetchInitialData();
  },
  
  addCaja: async (newCajaData) => {
    const { family } = get();
    const { error } = await supabase.from('cajas').insert({ ...newCajaData, family_id: family.id });
    if (error) console.error('Error adding caja:', error);
    else get().fetchInitialData();
  },
  
  saveBudget: async (budgetData) => {
    const { family } = get();
    const payload = { ...budgetData, family_id: family.id };
    const { error } = await supabase.from('budgets').upsert(payload, { onConflict: 'id' });
    if (error) console.error('Error saving budget:', error);
    else get().fetchInitialData();
  },

  deleteBudget: async (budgetId) => {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
    if (error) console.error('Error deleting budget:', error);
    else get().fetchInitialData();
  },
  
  addScheduledExpense: async (newExpenseData) => {
    const { family } = get();
    const { error } = await supabase.from('scheduled_expenses').insert({ ...newExpenseData, family_id: family.id });
    if (error) console.error('Error adding scheduled expense:', error);
    else get().fetchInitialData();
  },

  addCategory: async (categoryData) => {
    const { family } = get();
    const { error } = await supabase.from('categories').insert({ ...categoryData, family_id: family.id });
    if (error) console.error('Error adding category:', error);
    else get().fetchInitialData();
  },

  deleteCategory: async (categoryId) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) console.error('Error deleting category:', error);
    else get().fetchInitialData();
  },

  confirmScheduledExpense: async (transactionData, scheduledExpenseId) => {
    const { family, scheduledExpenses } = get();
    const expense = scheduledExpenses.find(e => e.id === scheduledExpenseId);
    if (!expense) return;

    const periodKey = format(new Date(), 'yyyy-MM');

    const { error: txError } = await supabase.from('transactions').insert({ ...transactionData, family_id: family.id });
    if (txError) {
      console.error('Error confirming expense:', txError);
      return;
    }

    const updatedConfirmedMonths = [...(expense.confirmed_months || []), periodKey];
    const { error: updateError } = await supabase
      .from('scheduled_expenses')
      .update({ confirmed_months: updatedConfirmedMonths })
      .eq('id', scheduledExpenseId);

    if (updateError) console.error('Error updating scheduled expense:', updateError);
    else get().fetchInitialData();
  },
}));
