import * as yup from "yup";
import { useI18n } from "vue-i18n";

export const useGlobalSchema = () => {
  const { t } = useI18n();

  return yup.object({
    name: yup
      .string()
      .required(t("validation.nameRequired"))
      .min(3, t("validation.nameMin"))
      .max(30, t("validation.nameMax")),

    country: yup.string().required(t("validation.countryRequired")),

    countries: yup
      .array()
      .of(yup.string())
      .min(1, t("validation.countriesRequired"))
      .required(t("validation.countriesRequired")),

    promotion: yup
      .date()
      .nullable()
      .required(t("validation.promotionRequired")),

    holidays: yup
      .array()
      .of(yup.date().nullable().required(t("validation.holidaysDateRequired")))
      .required(t("validation.holidaysRequired"))
      .min(2, t("validation.holidaysMin")),

    message: yup
      .string()
      .required(t("validation.messageRequired"))
      .min(10, t("validation.messageMin"))
      .max(500, t("validation.messageMax")),
  });
};
