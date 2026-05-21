import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useReducer } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  submitLoginRequest,
  type LoginMethod,
  type LoginPayload,
  type PlaceholderRequest,
} from '@/lib/mock-requests';

type LoginState = {
  email: string;
  error: string | null;
  password: string;
  request: PlaceholderRequest<LoginPayload> | null;
  status: 'idle' | 'submitting' | 'accepted' | 'error';
};

type LoginAction =
  | { type: 'emailChanged'; value: string }
  | { type: 'passwordChanged'; value: string }
  | { type: 'submitStarted' }
  | { type: 'submitSucceeded'; request: PlaceholderRequest<LoginPayload> }
  | { type: 'submitFailed'; error: string };

const initialLoginState: LoginState = {
  email: 'owner@fastbid.app',
  error: null,
  password: '',
  request: null,
  status: 'idle',
};

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case 'emailChanged':
      return { ...state, email: action.value, request: null };
    case 'passwordChanged':
      return { ...state, password: action.value, request: null };
    case 'submitStarted':
      return { ...state, error: null, request: null, status: 'submitting' };
    case 'submitSucceeded':
      return { ...state, request: action.request, status: 'accepted' };
    case 'submitFailed':
      return { ...state, error: action.error, status: 'error' };
    default:
      return state;
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);

  const enterApp = () => {
    router.replace('/(tabs)');
  };

  const submitLogin = async (method: LoginMethod) => {
    dispatch({ type: 'submitStarted' });

    try {
      const request = await submitLoginRequest({
        email: state.email,
        method,
      });

      dispatch({ request, type: 'submitSucceeded' });
    } catch {
      dispatch({ error: 'Could not submit login request.', type: 'submitFailed' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <MaterialIcons name="bolt" size={30} color="#FFFFFF" />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>FastBid</Text>
              <Text style={styles.brandLine}>Contractor bids without the typing.</Text>
            </View>
          </View>

          <View style={styles.heroPanel}>
            <View style={styles.loginCopy}>
              <Text style={styles.kicker}>Secure sign in</Text>
              <Text style={styles.title}>Open your bid desk.</Text>
              <Text style={styles.subtitle}>
                Jump back into active estimates, past invoices, and the company memory that supports
                every quote.
              </Text>
            </View>

            <Pressable
              disabled={state.status === 'submitting'}
              onPress={() => submitLogin('faceId')}
              style={[styles.faceButton, state.status === 'submitting' && styles.disabledButton]}>
              <MaterialIcons name="face" size={24} color="#FFFFFF" />
              <Text style={styles.faceButtonText}>Continue with Face ID</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputShell}>
                  <MaterialIcons name="mail-outline" size={21} color="#64748B" />
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onChangeText={(value) => dispatch({ type: 'emailChanged', value })}
                    placeholder="you@company.com"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={state.email}
                  />
                </View>
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputShell}>
                  <MaterialIcons name="lock-outline" size={21} color="#64748B" />
                  <TextInput
                    onChangeText={(value) => dispatch({ type: 'passwordChanged', value })}
                    placeholder="Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    style={styles.input}
                    value={state.password}
                  />
                </View>
              </View>

              <Pressable
                disabled={state.status === 'submitting'}
                style={[styles.emailButton, state.status === 'submitting' && styles.disabledButton]}
                onPress={() => submitLogin('password')}>
                <Text style={styles.emailButtonText}>
                  {state.status === 'submitting' ? 'Submitting...' : 'Sign in'}
                </Text>
                <MaterialIcons name="arrow-forward" size={19} color="#0F172A" />
              </Pressable>
            </View>

            {state.request ? (
              <View style={styles.requestPanel}>
                <Text style={styles.requestLabel}>Placeholder auth request</Text>
                <Text style={styles.requestValue}>{state.request.requestId}</Text>
                <Text style={styles.requestMeta}>Method: {state.request.data.method}</Text>
                <Text style={styles.requestMeta}>Email: {state.request.data.email}</Text>
                <Pressable style={styles.continueButton} onPress={enterApp}>
                  <Text style={styles.continueButtonText}>Continue to Home</Text>
                  <MaterialIcons name="construction" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null}

            {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}
          </View>

          <View style={styles.footerRow}>
            <View style={styles.footerItem}>
              <MaterialIcons name="verified-user" size={19} color="#116466" />
              <Text style={styles.footerText}>Private company memory</Text>
            </View>
            <View style={styles.footerItem}>
              <MaterialIcons name="history" size={19} color="#7C2D12" />
              <Text style={styles.footerText}>Old bids stay cited</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    gap: 18,
    padding: 20,
    paddingBottom: 30,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
    paddingTop: 8,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  brandCopy: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  brandName: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandLine: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  heroPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    gap: 18,
    padding: 16,
  },
  loginCopy: {
    gap: 6,
  },
  kicker: {
    color: '#116466',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  faceButton: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 14,
  },
  faceButtonText: {
    color: '#FFFFFF',
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.62,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  divider: {
    backgroundColor: '#E5E7EB',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  form: {
    gap: 13,
  },
  inputWrap: {
    gap: 7,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  input: {
    color: '#0F172A',
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 0,
  },
  emailButton: {
    alignItems: 'center',
    backgroundColor: '#FACC15',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 51,
    paddingHorizontal: 14,
  },
  emailButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  requestPanel: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 12,
  },
  requestLabel: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  requestValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },
  requestMeta: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 12,
  },
  footerText: {
    color: '#334155',
    flex: 1,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
});
