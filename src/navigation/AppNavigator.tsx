import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Platform, Image, useWindowDimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import TokenScreen from '../screens/TokenScreen';
import ReembolsoScreen from '../screens/ReembolsoScreen';
import OSScreen from '../screens/OSScreen';

type Tab = 'token' | 'reembolso' | 'os';

const SIDEBAR_WIDTH = 240;

const MENU: { key: Tab; label: string; icon: string; sub: string }[] = [
  { key: 'token',     label: 'Gerador de Token',  icon: '🔑', sub: 'Acesso a máquinas' },
  { key: 'reembolso', label: 'Reembolso',          icon: '🧾', sub: 'Lançamento de notas' },
  { key: 'os',        label: 'Ordem de Serviço',   icon: '📋', sub: 'Formulário de OS' },
];

export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState<Tab>('token');
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  // Título fixo — reseta sempre que a aba mudar
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'Plataforma Interna - Selgron';
    }
  });

  // No desktop o menu fica sempre aberto
  useEffect(() => {
    if (isDesktop) {
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      setOpen(true);
    } else {
      Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 200, useNativeDriver: false }).start();
      setOpen(false);
    }
  }, [isDesktop]);

  function toggle() {
    if (open) {
      Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 220, useNativeDriver: false }).start();
      setOpen(false);
    } else {
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start();
      setOpen(true);
    }
  }

  function navegar(tab: Tab) {
    setActiveTab(tab);
    if (!isDesktop) toggle();
  }

  const activeItem = MENU.find(m => m.key === activeTab)!;

  return (
    <View style={styles.root}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggle} style={styles.hamburger}>
          <Text style={styles.hamburgerIcon}>{open && !isDesktop ? '✕' : '☰'}</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {activeItem.icon}  {activeItem.label}
        </Text>
      </View>

      <View style={styles.body}>
        {/* ── Overlay ── */}
        {open && (
          <TouchableOpacity style={styles.overlay} onPress={toggle} activeOpacity={1} />
        )}

        {/* ── Sidebar (sempre overlay, nunca empurra o conteúdo) ── */}
        <Animated.View style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}>
          <Image
            source={require('../../assets/selgron-logo.png')}
            style={styles.sidebarLogo}
            resizeMode="contain"
          />
          <Text style={styles.sidebarSub}>Plataforma Interna</Text>
          <View style={styles.sidebarDivider} />

          {MENU.map(item => {
            const ativo = activeTab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, ativo && styles.menuItemAtivo]}
                onPress={() => navegar(item.key)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View>
                  <Text style={[styles.menuLabel, ativo && styles.menuLabelAtivo]}>
                    {item.label}
                  </Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* ── Conteúdo (sempre largura total) ── */}
        <View style={styles.content}>
          {activeTab === 'token'     && <TokenScreen />}
          {activeTab === 'reembolso' && <ReembolsoScreen />}
          {activeTab === 'os'        && <OSScreen />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    height: 52,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
    zIndex: 100,
  },
  hamburger: { padding: 8 },
  hamburgerIcon: { fontSize: 20, color: Colors.text },
  topBarTitle: { flex: 1, color: Colors.text, fontWeight: 'bold', fontSize: 15 },
  body: { flex: 1, flexDirection: 'row', position: 'relative' },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10,
  },

  sidebar: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.card,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 20,
    paddingHorizontal: 12,
    zIndex: 20,
  },

  sidebarLogo: { width: '100%', height: 56, marginBottom: 4 },
  sidebarSub: {
    color: Colors.textSecondary, fontSize: 11,
    letterSpacing: 2, textAlign: 'center', marginBottom: 16,
  },
  sidebarDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },

  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 8, marginBottom: 4,
  },
  menuItemAtivo: { backgroundColor: '#2A1E00' },
  menuIcon: { fontSize: 20 },
  menuLabel: { color: Colors.textSecondary, fontWeight: 'bold', fontSize: 13 },
  menuLabelAtivo: { color: Colors.primary },
  menuSub: { color: Colors.textSecondary, fontSize: 10, opacity: 0.6, marginTop: 1 },

  content: { flex: 1 },
});
