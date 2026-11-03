import { useToast } from 'primevue/usetoast';

export function useToastMsg() {
  const toast = useToast();
  const { t } = useI18n();

  const showToast = (severity, summary, detail, life = 2000) => {
    toast.add({ severity, summary, detail, life });
  };

  const showErrorToast = (message) => {
    showToast('error', t('common.error'), message);
  };

  const showSuccessToast = (message) => {
    showToast('success', t('common.success'), message);
  };

  const showInfoToast = (message) => {
    showToast('info', t('common.info'), message);
  };

  const showWarnToast = (message) => {
    showToast('warn', t('common.warning'), message);
  };

  return {
    toast,
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    showWarnToast,
  };
}
