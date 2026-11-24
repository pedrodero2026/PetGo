import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

interface Result<T> {
  key?: string;
  data?: T;
  error?: string;
}

/**
 * Carrega dados de um serviço e recarrega sempre que a tela volta ao foco
 * (ex.: ao voltar do formulário de pet, a lista já aparece atualizada).
 * `deps` deve conter valores simples (ids, textos).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const key = JSON.stringify(deps);
  const [result, setResult] = useState<Result<T>>({});

  // Guarda sempre a versão mais nova da função sem recriar o load
  const fnRef = useRef(fn);
  useLayoutEffect(() => {
    fnRef.current = fn;
  });

  const load = useCallback(async (k: string) => {
    try {
      const data = await fnRef.current();
      setResult({ key: k, data });
    } catch (e) {
      setResult((cur) => ({ ...cur, key: k, error: e instanceof Error ? e.message : 'Erro ao carregar.' }));
    }
  }, []);

  // Carrega quando as dependências mudam
  useEffect(() => {
    load(key);
  }, [key, load]);

  // Atualiza silenciosamente ao voltar para a tela
  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      load(key);
    }, [key, load]),
  );

  return {
    data: result.data,
    // Enquanto o resultado não corresponde às dependências atuais, está carregando
    loading: result.key !== key,
    error: result.error,
    reload: useCallback(() => load(key), [key, load]),
  };
}
