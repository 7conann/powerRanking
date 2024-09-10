const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mugpnilbgwfuzhtyizfh.supabase.co'; // Substitua pela sua URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3BuaWxiZ3dmdXpodHlpemZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NTY1MTYsImV4cCI6MjAzOTIzMjUxNn0.4_xLeNZKLXItRQt9vz4JOuxljPUL20AJESehddUZyuE'; // Substitua pela sua chave de API do Supabase
const TABLE_NAME = 'atm-quiz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchData() {
    console.log('Iniciando a consulta ao Supabase...');
    let { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .limit(1); // Pegando apenas o primeiro vídeo
  
    console.log('Resposta completa:', { data, error });
  
    if (error) {
      console.error('Erro ao consultar o Supabase:', error);
    } else if (data.length === 0) {
      console.warn('Nenhum dado encontrado na tabela workez.');
    } else {
      console.log('Dados recebidos do Supabase:', data);
      const videoData = data[0];
      const quizRanking = videoData.quizRanking;
      const quisRankingGlobal = videoData.quisRankingGlobal;

      console.log('quizRanking:', quizRanking);
      console.log('quisRankingGlobal:', quisRankingGlobal);
    }
}
fetchData();