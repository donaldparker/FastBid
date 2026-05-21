import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  Alert,
  GestureResponderEvent,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type View as ViewType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  submitProjectDraftRequest,
  type PlaceholderRequest,
  type ProjectDraftPayload,
} from '@/lib/mock-requests';
import type { DraftLineItem, DraftPhoto, PricingMode } from '@/lib/project-draft-types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

type ProjectDraftState = {
  customMargin: boolean;
  customMarginPercent: string;
  description: string;
  error: string | null;
  lineItems: DraftLineItem[];
  marginIncluded: boolean;
  marginPercent: number;
  pendingFocusLineItemId: string | null;
  request: PlaceholderRequest<ProjectDraftPayload> | null;
  status: 'idle' | 'submitting' | 'accepted' | 'error';
  title: string;
};

type ProjectDraftAction =
  | { type: 'titleChanged'; value: string }
  | { type: 'descriptionChanged'; value: string }
  | { type: 'marginIncludedToggled' }
  | { type: 'marginPercentChanged'; value: number }
  | { type: 'customMarginToggled' }
  | { type: 'customMarginPercentChanged'; value: string }
  | { type: 'lineItemAdded'; item: DraftLineItem }
  | { type: 'lineItemFocusHandled' }
  | { type: 'lineItemTextChanged'; id: string; text: string }
  | { type: 'lineItemModeChanged'; id: string; mode: PricingMode }
  | { type: 'lineItemPhotoAdded'; lineItemId: string; photo: DraftPhoto }
  | { type: 'lineItemPhotoRemoved'; lineItemId: string; photoId: string }
  | { type: 'submitStarted' }
  | { type: 'submitSucceeded'; request: PlaceholderRequest<ProjectDraftPayload> }
  | { type: 'submitFailed'; error: string };

const initialProjectDraftState: ProjectDraftState = {
  customMargin: false,
  customMarginPercent: '125',
  description: '',
  error: null,
  lineItems: [],
  marginIncluded: true,
  marginPercent: 22,
  pendingFocusLineItemId: null,
  request: null,
  status: 'idle',
  title: '',
};

function projectDraftReducer(
  state: ProjectDraftState,
  action: ProjectDraftAction
): ProjectDraftState {
  switch (action.type) {
    case 'titleChanged':
      return { ...state, request: null, title: action.value };
    case 'descriptionChanged':
      return { ...state, request: null, description: action.value };
    case 'marginIncludedToggled':
      return { ...state, marginIncluded: !state.marginIncluded, request: null };
    case 'marginPercentChanged':
      return { ...state, marginPercent: action.value, request: null };
    case 'customMarginToggled':
      return { ...state, customMargin: !state.customMargin, request: null };
    case 'customMarginPercentChanged':
      return { ...state, customMarginPercent: action.value, request: null };
    case 'lineItemAdded':
      return {
        ...state,
        lineItems: [...state.lineItems, action.item],
        pendingFocusLineItemId: action.item.id,
        request: null,
      };
    case 'lineItemFocusHandled':
      return { ...state, pendingFocusLineItemId: null };
    case 'lineItemTextChanged':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id ? { ...item, text: action.text } : item
        ),
        request: null,
      };
    case 'lineItemModeChanged':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id ? { ...item, mode: action.mode } : item
        ),
        request: null,
      };
    case 'lineItemPhotoAdded':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.lineItemId
            ? { ...item, photos: [...item.photos, action.photo] }
            : item
        ),
        request: null,
      };
    case 'lineItemPhotoRemoved':
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.lineItemId
            ? {
                ...item,
                photos: item.photos.filter((photo) => photo.id !== action.photoId),
              }
            : item
        ),
        request: null,
      };
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

function createProjectDraftPayload(state: ProjectDraftState): ProjectDraftPayload {
  return {
    customMargin: state.customMargin,
    customMarginPercent: state.customMarginPercent,
    description: state.description,
    lineItems: state.lineItems.map((item) => ({
      ...item,
      photos: item.photos.map((photo) => ({ ...photo })),
    })),
    marginIncluded: state.marginIncluded,
    marginPercent: state.marginPercent,
    pricingModeDefault: state.lineItems[0]?.mode ?? 'net',
    title: state.title,
  };
}

export default function ProjectOnboardScreen() {
  const router = useRouter();
  const [state, dispatch] = useReducer(projectDraftReducer, initialProjectDraftState);
  const animationFrameRef = useRef<number | null>(null);
  const lineItemInputRefs = useRef<Record<string, TextInput | null>>({});
  const marginIncludedRef = useRef(state.marginIncluded);
  const sliderLeftRef = useRef(0);
  const sliderTrackRef = useRef<ViewType>(null);
  const sliderWidthRef = useRef(0);

  useEffect(() => {
    marginIncludedRef.current = state.marginIncluded;
  }, [state.marginIncluded]);

  useEffect(() => {
    if (!state.pendingFocusLineItemId) {
      return;
    }

    const pendingFocusLineItemId = state.pendingFocusLineItemId;
    const focusHandle = requestAnimationFrame(() => {
      lineItemInputRefs.current[pendingFocusLineItemId]?.focus();
      dispatch({ type: 'lineItemFocusHandled' });
    });

    return () => cancelAnimationFrame(focusHandle);
  }, [state.lineItems, state.pendingFocusLineItemId]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const measureSlider = useCallback(() => {
    sliderTrackRef.current?.measure((_x, _y, width, _height, pageX) => {
      sliderWidthRef.current = width;
      sliderLeftRef.current = pageX;
    });
  }, []);

  const updateMarginPercent = useCallback((nextPercent: number) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      dispatch({ type: 'marginPercentChanged', value: nextPercent });
      animationFrameRef.current = null;
    });
  }, []);

  const updateMarginFromEvent = useCallback(
    (event: GestureResponderEvent) => {
      if (!marginIncludedRef.current || sliderWidthRef.current <= 0) {
        return;
      }

      const pageX = event.nativeEvent.pageX;
      const localX = pageX - sliderLeftRef.current;
      const nextPercent = Math.round(clamp(localX / sliderWidthRef.current, 0, 1) * 100);

      updateMarginPercent(nextPercent);
    },
    [updateMarginPercent]
  );

  const handleSliderLayout = useCallback(
    (event: LayoutChangeEvent) => {
      sliderWidthRef.current = event.nativeEvent.layout.width;
      requestAnimationFrame(measureSlider);
    },
    [measureSlider]
  );

  const sliderResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => marginIncludedRef.current,
        onPanResponderGrant: updateMarginFromEvent,
        onPanResponderMove: updateMarginFromEvent,
        onPanResponderRelease: updateMarginFromEvent,
        onStartShouldSetPanResponder: () => marginIncludedRef.current,
      }),
    [updateMarginFromEvent]
  );

  const updateCustomMargin = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');

    if (!numericValue) {
      dispatch({ type: 'customMarginPercentChanged', value: '' });
      return;
    }

    dispatch({
      type: 'customMarginPercentChanged',
      value: String(clamp(Number(numericValue), 0, 500)),
    });
  };

  const addLineItem = () => {
    const id = `line-item-${Date.now()}`;

    dispatch({
      item: {
        id,
        mode: 'net',
        photos: [],
        text: '',
      },
      type: 'lineItemAdded',
    });
  };

  const updateLineItemText = (id: string, text: string) => {
    dispatch({ id, text, type: 'lineItemTextChanged' });
  };

  const updateLineItemMode = (id: string, mode: PricingMode) => {
    dispatch({ id, mode, type: 'lineItemModeChanged' });
  };

  const addLineItemPhoto = async (lineItemId: string) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to attach photos to line items.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.75,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const photoUri = result.assets[0].uri;
    const lineItem = state.lineItems.find((item) => item.id === lineItemId);

    dispatch({
      lineItemId,
      photo: {
        id: `photo-${lineItemId}-${Date.now()}`,
        label: `Photo ${(lineItem?.photos.length ?? 0) + 1}`,
        uri: photoUri,
      },
      type: 'lineItemPhotoAdded',
    });
  };

  const removeLineItemPhoto = (lineItemId: string, photoId: string) => {
    dispatch({ lineItemId, photoId, type: 'lineItemPhotoRemoved' });
  };

  const submitDraft = async () => {
    dispatch({ type: 'submitStarted' });

    try {
      const request = await submitProjectDraftRequest(createProjectDraftPayload(state));

      dispatch({ request, type: 'submitSucceeded' });
    } catch {
      dispatch({ error: 'Could not submit project draft.', type: 'submitFailed' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.topHeader}>
            <Pressable
              accessibilityLabel="Back to Home"
              onPress={() => router.replace('/(tabs)')}
              style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={20} color="#0F172A" />
              <Text style={styles.backButtonText}>Home</Text>
            </Pressable>
            <View style={styles.headerIcon}>
              <MaterialIcons name="add-task" size={24} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.kicker}>New project</Text>
            <Text style={styles.title}>Set up the bid basics.</Text>
            <Text style={styles.subtitle}>
              Capture enough detail for FastBid to draft a clean scope, margin target, and risk
              review.
            </Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                onChangeText={(value) => dispatch({ type: 'titleChanged', value })}
                placeholder="Johnson fence repair"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
                value={state.title}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                multiline
                onChangeText={(value) => dispatch({ type: 'descriptionChanged', value })}
                placeholder="Customer wants 18 feet replaced, haul-away included, stain optional."
                placeholderTextColor="#94A3B8"
                style={[styles.textInput, styles.descriptionInput]}
                textAlignVertical="top"
                value={state.description}
              />
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.panelTitleCopy}>
                <Text style={styles.sectionLabel}>Bid builder</Text>
                <Text style={styles.sectionTitle}>Line items</Text>
              </View>
              {state.lineItems.length > 0 ? (
                <Pressable
                  accessibilityLabel="Add line item"
                  onPress={addLineItem}
                  style={styles.smallAddButton}>
                  <MaterialIcons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.smallAddButtonText}>Add</Text>
                </Pressable>
              ) : null}
            </View>

            {state.lineItems.length === 0 ? (
              <Pressable
                accessibilityLabel="Add line item"
                onPress={addLineItem}
                style={styles.emptyBuilder}>
                <View style={styles.emptyBuilderIcon}>
                  <MaterialIcons name="mic" size={24} color="#116466" />
                </View>
                <Text style={styles.emptyBuilderTitle}>Add Line Item</Text>
                <Text style={styles.emptyBuilderCopy}>
                  Tap, then use keyboard voice input to dictate scope, quantity, spec, and price.
                </Text>
              </Pressable>
            ) : (
              <View style={styles.lineItemList}>
                {state.lineItems.map((lineItem, index) => (
                  <View key={lineItem.id} style={styles.lineItemCard}>
                    <View style={styles.lineItemTop}>
                      <Text style={styles.lineItemLabel}>Line item {index + 1}</Text>
                      <View style={styles.radioGroup}>
                        {(['net', 'cost'] as PricingMode[]).map((mode) => (
                          <Pressable
                            accessibilityRole="radio"
                            accessibilityState={{ checked: lineItem.mode === mode }}
                            key={mode}
                            onPress={() => updateLineItemMode(lineItem.id, mode)}
                            style={[
                              styles.radioOption,
                              lineItem.mode === mode && styles.radioOptionActive,
                            ]}>
                            <View
                              style={[
                                styles.radioDot,
                                lineItem.mode === mode && styles.radioDotActive,
                              ]}
                            />
                            <Text
                              style={[
                                styles.radioText,
                                lineItem.mode === mode && styles.radioTextActive,
                              ]}>
                              {mode === 'net' ? 'Net' : 'Cost'}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                    <TextInput
                      multiline
                      onChangeText={(value) => updateLineItemText(lineItem.id, value)}
                      placeholder="Pour 20ft x 40ft of concrete at XXXpsi, stamped and sealed, price 1800 dollars."
                      placeholderTextColor="#94A3B8"
                      ref={(input) => {
                        lineItemInputRefs.current[lineItem.id] = input;
                      }}
                      style={[styles.textInput, styles.lineItemInput]}
                      textAlignVertical="top"
                      value={lineItem.text}
                    />

                    <View style={styles.photoBuilder}>
                      <View style={styles.photoHeader}>
                        <Text style={styles.photoTitle}>Photos</Text>
                        <Text style={styles.photoDetail}>
                          Attach job photos that support this line item.
                        </Text>
                      </View>

                      {lineItem.photos.length === 0 ? (
                        <Pressable
                          accessibilityLabel={`Take photo for line item ${index + 1}`}
                          onPress={() => addLineItemPhoto(lineItem.id)}
                          style={styles.emptyPhotoState}>
                          <MaterialIcons name="photo-camera" size={24} color="#116466" />
                          <Text style={styles.emptyPhotoTitle}>Take photo</Text>
                          <Text style={styles.emptyPhotoCopy}>
                            Start with a photo of the work area, material, or measurement.
                          </Text>
                        </Pressable>
                      ) : (
                        <View style={styles.photoStack}>
                          <View style={styles.photoGrid}>
                            {lineItem.photos.map((photo, photoIndex) => (
                              <View key={photo.id} style={styles.photoTile}>
                                <Image
                                  contentFit="cover"
                                  source={{ uri: photo.uri }}
                                  style={styles.photoPreview}
                                />
                                <Pressable
                                  accessibilityLabel={`Delete photo ${photoIndex + 1} from line item ${index + 1}`}
                                  onPress={() => removeLineItemPhoto(lineItem.id, photo.id)}
                                  style={styles.deletePhotoButton}>
                                  <MaterialIcons name="close" size={17} color="#FFFFFF" />
                                </Pressable>
                              </View>
                            ))}
                          </View>
                          <Pressable
                            accessibilityLabel={`Add photo to line item ${index + 1}`}
                            onPress={() => addLineItemPhoto(lineItem.id)}
                            style={styles.addPhotoButton}>
                            <MaterialIcons name="add-a-photo" size={18} color="#0F172A" />
                            <Text style={styles.addPhotoButtonText}>Add photo</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.panel}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: state.marginIncluded }}
              onPress={() => dispatch({ type: 'marginIncludedToggled' })}
              style={styles.checkRow}>
              <MaterialIcons
                name={state.marginIncluded ? 'check-box' : 'check-box-outline-blank'}
                size={25}
                color="#116466"
              />
              <View style={styles.checkCopy}>
                <Text style={styles.checkTitle}>Margin included</Text>
                <Text style={styles.checkDetail}>Use a standard margin percentage in the draft.</Text>
              </View>
              <Text style={styles.percentBadge}>{state.marginPercent}%</Text>
            </Pressable>

            <View style={[styles.sliderWrap, !state.marginIncluded && styles.disabledControl]}>
              <View
                onLayout={handleSliderLayout}
                ref={sliderTrackRef}
                style={styles.sliderHitArea}
                {...sliderResponder.panHandlers}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${state.marginPercent}%` }]} />
                  <View style={[styles.sliderThumb, { left: `${state.marginPercent}%` }]} />
                </View>
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0%</Text>
                <Text style={styles.sliderLabel}>50%</Text>
                <Text style={styles.sliderLabel}>100%</Text>
              </View>
            </View>
          </View>

          <View style={styles.panel}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: state.customMargin }}
              onPress={() => dispatch({ type: 'customMarginToggled' })}
              style={styles.checkRow}>
              <MaterialIcons
                name={state.customMargin ? 'check-box' : 'check-box-outline-blank'}
                size={25}
                color="#116466"
              />
              <View style={styles.checkCopy}>
                <Text style={styles.checkTitle}>Custom</Text>
                <Text style={styles.checkDetail}>Override the standard slider with a higher cap.</Text>
              </View>
            </Pressable>

            <View style={[styles.customInputShell, !state.customMargin && styles.disabledControl]}>
              <TextInput
                editable={state.customMargin}
                keyboardType="numeric"
                onChangeText={updateCustomMargin}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                style={styles.customInput}
                value={state.customMarginPercent}
              />
              <Text style={styles.customSuffix}>% max 500</Text>
            </View>
          </View>

          {state.request ? (
            <View style={styles.requestPanel}>
              <Text style={styles.requestLabel}>Placeholder project request</Text>
              <Text style={styles.requestValue}>{state.request.requestId}</Text>
              <Text style={styles.requestMeta}>
                Title: {state.request.data.title || 'Untitled project'}
              </Text>
              <Text style={styles.requestMeta}>
                Line items: {state.request.data.lineItems.length}
              </Text>
              <Text style={styles.requestMeta}>
                Margin:{' '}
                {state.request.data.marginIncluded
                  ? `${state.request.data.marginPercent}% standard`
                  : 'Not included'}
              </Text>
              {state.request.data.customMargin ? (
                <Text style={styles.requestMeta}>
                  Custom cap: {state.request.data.customMarginPercent || '0'}%
                </Text>
              ) : null}
            </View>
          ) : null}

          {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}

          <Pressable
            disabled={state.status === 'submitting'}
            onPress={submitDraft}
            style={[styles.primaryButton, state.status === 'submitting' && styles.disabledButton]}>
            <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              {state.status === 'submitting' ? 'Submitting...' : 'Create draft'}
            </Text>
          </Pressable>
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
    alignSelf: 'center',
    gap: 18,
    maxWidth: 760,
    padding: 20,
    paddingBottom: 96,
    width: '100%',
  },
  topHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: '#116466',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 35,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E5E4',
    borderRadius: 8,
    borderWidth: 1,
    gap: 15,
    padding: 16,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  panelTitleCopy: {
    flex: 1,
    flexShrink: 1,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 26,
    marginTop: 2,
  },
  smallAddButton: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 11,
  },
  smallAddButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyBuilder: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 7,
    minHeight: 154,
    justifyContent: 'center',
    padding: 18,
  },
  emptyBuilderIcon: {
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  emptyBuilderTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  emptyBuilderCopy: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 420,
    textAlign: 'center',
  },
  lineItemList: {
    gap: 12,
  },
  lineItemCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    gap: 11,
    padding: 12,
  },
  lineItemTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  lineItemLabel: {
    color: '#334155',
    flex: 1,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  radioGroup: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    flexDirection: 'row',
    padding: 3,
  },
  radioOption: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  radioOptionActive: {
    backgroundColor: '#FFFFFF',
  },
  radioDot: {
    borderColor: '#64748B',
    borderRadius: 999,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  radioDotActive: {
    backgroundColor: '#116466',
    borderColor: '#116466',
  },
  radioText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '900',
  },
  radioTextActive: {
    color: '#0F172A',
  },
  lineItemInput: {
    minHeight: 92,
    paddingTop: 12,
  },
  photoBuilder: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 11,
    padding: 12,
  },
  photoHeader: {
    gap: 2,
  },
  photoTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  photoDetail: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
  },
  addPhotoButton: {
    alignItems: 'center',
    backgroundColor: '#FACC15',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  addPhotoButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyPhotoState: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 6,
    minHeight: 132,
    justifyContent: 'center',
    padding: 14,
  },
  emptyPhotoTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyPhotoCopy: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoStack: {
    gap: 11,
  },
  photoTile: {
    alignItems: 'center',
    backgroundColor: '#D9E8DF',
    borderColor: '#99F6E4',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    height: 112,
    overflow: 'hidden',
    width: 112,
  },
  photoPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  deletePhotoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 7,
    top: 7,
    width: 30,
  },
  inputGroup: {
    gap: 7,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  descriptionInput: {
    minHeight: 112,
    paddingTop: 12,
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  checkCopy: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  checkTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  checkDetail: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  percentBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    color: '#14532D',
    fontSize: 14,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sliderWrap: {
    gap: 8,
  },
  sliderHitArea: {
    justifyContent: 'center',
    minHeight: 42,
  },
  sliderTrack: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    height: 14,
    justifyContent: 'center',
    overflow: 'visible',
  },
  sliderFill: {
    backgroundColor: '#116466',
    borderRadius: 999,
    height: 14,
  },
  sliderThumb: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0F172A',
    borderRadius: 999,
    borderWidth: 3,
    height: 30,
    marginLeft: -15,
    position: 'absolute',
    width: 30,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  disabledControl: {
    opacity: 0.45,
  },
  customInputShell: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  customInput: {
    color: '#0F172A',
    flex: 1,
    fontSize: 19,
    fontWeight: '900',
    minWidth: 0,
  },
  customSuffix: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '900',
  },
  requestPanel: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 14,
  },
  requestLabel: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  requestValue: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  requestMeta: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 14,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
