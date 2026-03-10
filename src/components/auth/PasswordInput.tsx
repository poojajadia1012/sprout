import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = TextInputProps & {
  error?: string | null;
};

const PasswordInput = forwardRef<TextInput, Props>(
  ({ error, style, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <View style={styles.wrapper}>
        <View style={[styles.row, error ? styles.errorBorder : styles.defaultBorder]}>
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
            {...rest}
          />
          <TouchableOpacity onPress={() => setVisible((v) => !v)} style={styles.toggle}>
            <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  defaultBorder: {
    borderColor: '#E5E7EB',
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  toggleText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
