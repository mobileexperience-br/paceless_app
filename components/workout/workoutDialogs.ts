import { Alert } from 'react-native';

export function confirmDiscard(onConfirm: () => void): void {
  Alert.alert('Descartar treino?', 'O treino em andamento será descartado.', [
    { text: 'Continuar', style: 'cancel' },
    { text: 'Descartar', style: 'destructive', onPress: onConfirm },
  ]);
}

export function confirmStop(onConfirm: () => void): void {
  Alert.alert('Parar treino?', 'O treino será encerrado e salvo.', [
    { text: 'Continuar', style: 'cancel' },
    { text: 'Parar', style: 'destructive', onPress: onConfirm },
  ]);
}

export function showGpsHelp(): void {
  Alert.alert(
    'Ajuda com GPS',
    'Fique ao ar livre, com céu aberto, e aguarde alguns segundos até o sinal estabilizar.\n\nMantenha a localização ativada e permita o acesso ao Paceless durante o treino.\n\nSe a distância parar de contar com a tela bloqueada, desative a economia de bateria para o Paceless.\n\nO ritmo atual aparece após 100 m ou 30 s de treino.',
  );
}
