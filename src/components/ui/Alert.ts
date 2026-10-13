import { Alert as NativeAlert } from 'react-native';
import { translate } from '@/utils/intl';

/** Dialog copy uses the current selection at the time the dialog opens. */
export const Alert = {
  ...NativeAlert,
  alert: (...[title, message, buttons, options]: Parameters<typeof NativeAlert.alert>) => NativeAlert.alert(
    translate(title),
    message && translate(message),
    buttons?.map(button => ({ ...button, text: button.text && translate(button.text) })),
    options,
  ),
};
