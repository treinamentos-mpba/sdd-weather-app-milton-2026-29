import type { AppError, ErrorKind } from '../types/errors';

const messages: Record<ErrorKind, string> = {
  timeout: 'A requisição demorou demais.',
  network: 'Falha de rede.',
  http: 'O serviço está indisponível. Tente novamente.',
  'rate-limit': 'Limite de consultas atingido. Aguarde antes de tentar novamente.',
  'invalid-response': 'O serviço retornou uma resposta inválida.',
  'permission-denied': 'Permissão de localização negada. Busque uma cidade.',
  unavailable: 'Localização indisponível. Busque uma cidade.',
  'storage-read': 'Não foi possível ler as preferências salvas.',
  'storage-write': 'Não foi possível salvar as preferências.',
  'storage-remove': 'Não foi possível apagar as preferências salvas.',
  unexpected: 'Ocorreu uma falha inesperada. Tente novamente.',
};

export function getServiceErrorMessage(error: AppError): string {
  return messages[error.kind];
}
