"use client";

export const fetchAddressByCep = async (cep: string) => {
  try {
    const cleanCep = cep.replace(/\D/g, "");
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error("CEP inválido");
    return {
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch (err) {
    console.error("Erro ao buscar endereço:", err);
    return null;
  }
};
