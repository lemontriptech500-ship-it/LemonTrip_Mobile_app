import 'expo-router/entry';

if (process.env.EXPO_OS === 'android') {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./src/widgets/widget-task-handler');

  registerWidgetTaskHandler(widgetTaskHandler);
}
