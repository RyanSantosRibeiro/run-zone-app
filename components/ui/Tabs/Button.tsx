import { TouchableOpacity, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabButton({ children, onPress, accessibilityState, label }) {
  const focused = accessibilityState.selected;
  console.log({accessibilityState})
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: focused ? '#B2FF00' : 'rgba(178, 255, 0, 0.1)', // fundo ativo e inativo
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        flexDirection: 'row',
      }}
    >
      <View style={{ marginRight: 6 }}>
        {children /* aqui vem o ícone */}
      </View>
      {focused && (
        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
