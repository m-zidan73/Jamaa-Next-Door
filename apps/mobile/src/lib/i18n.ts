import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import de from "../locales/de.json";
import en from "../locales/en.json";
import tr from "../locales/tr.json";

const resources = {
  en: { translation: en },
  de: { translation: de },
  tr: { translation: tr },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";
const fallbackLanguage = ["en", "de", "tr"].includes(deviceLanguage) ? deviceLanguage : "en";

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: fallbackLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
