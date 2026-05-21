import { useEffect } from 'react';
import { useCrmStore } from '../store/crmStore';
import { getContact } from '../api/contacts.api';

export const useContacts = (email) => {
  const { setContact, setLoading, setError, clearError } = useCrmStore();

  useEffect(() => {
    if (!email) {
      setContact(null);
      return;
    }

    const fetchContact = async () => {
      try {
        clearError();
        setLoading(true);
        const contact = await getContact(email);
        setContact(contact);
      } catch (err) {
        setError(err.message || 'Failed to fetch contact');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [email, setContact, setLoading, setError, clearError]);
};
