export async function readAccountResponse(response: Response): Promise<{error?: string; message?: string}> {
  try {
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid response');
    return data as {error?: string; message?: string};
  } catch {
    if (response.status === 429) throw new Error('Muitas tentativas. Aguarde 15 minutos e tente novamente.');
    throw new Error('O serviço de acesso está temporariamente indisponível. Aguarde alguns instantes e tente novamente.');
  }
}
