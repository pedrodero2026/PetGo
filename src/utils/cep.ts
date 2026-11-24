export interface CepResult {
  street: string;
  district: string;
  city: string;
  state: string;
}

/** Busca o endereço pelo CEP na API pública ViaCEP. Retorna null se não achar ou sem internet. */
export async function lookupCep(cep: string): Promise<CepResult | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
    const json = await res.json();
    if (json.erro) return null;
    return { street: json.logradouro, district: json.bairro, city: json.localidade, state: json.uf };
  } catch {
    return null;
  }
}
