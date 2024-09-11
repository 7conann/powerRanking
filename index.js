document.addEventListener('DOMContentLoaded', () => {
  const SUPABASE_URL = 'https://eunburxiqtzftppqvxtr.supabase.co'; // Substitua pela sua URL do Supabase
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmJ1cnhpcXR6ZnRwcHF2eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1Njc3MzEsImV4cCI6MjA0MTE0MzczMX0.y-EgwTJ-uEzbLa_bTSzbEN10dSyTVrSJ27zrl51MLKc'; // Substitua pela sua chave de API do Supabase
  const TABLE_NAME = 'atm-dadosMentorBeta';

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function fetchData() {
      console.log('Iniciando a consulta ao Supabase...');
      let { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*');
    
      console.log('Resposta completa:', { data, error });
    
      if (error) {
        console.error('Erro ao consultar o Supabase:', error);
      } else if (data.length === 0) {
        console.warn('Nenhum dado encontrado na tabela workez.');
      } else {
        console.log('Dados recebidos do Supabase:', data);
        
        // Filtrar os dados que possuem quizProgress
        const validData = data.filter(item => item.quizProgress && item.quizProgress.data && item.quizProgress.data.length > 0);

        if (validData.length > 0) {
            // Extrair e combinar todos os dados de quizProgress
            const allQuizProgress = validData.flatMap(item => item.quizProgress.data);

            // Ordenar os dados de quizProgress
            const rankedQuizProgress = allQuizProgress.sort((a, b) => {
              if (a.timing === b.timing) {
                return b.score - a.score; // Maior pontuação primeiro em caso de empate no tempo
              }
              return a.timing - b.timing; // Menor tempo primeiro
            });

            console.log('Rankeamento de quizProgress:', rankedQuizProgress);
            updateRanking(rankedQuizProgress, validData); // Passar os dados rankeados e os dados válidos
        } else {
            console.warn('Nenhum dado de quizProgress encontrado.');
        }
      }
  }

  function updateRanking(rankedQuizProgress, validData) {
      const rankingContainer = document.getElementById('ranking-container');
      rankingContainer.innerHTML = ''; // Limpar o conteúdo existente

      rankedQuizProgress.forEach((item, index) => {
          const rankItem = document.createElement('div');
          rankItem.classList.add('rank-item');

          // Adicionar classes para os três primeiros colocados
          if (index === 0) {
              rankItem.classList.add('first');
          } else if (index === 1) {
              rankItem.classList.add('second');
          } else if (index === 2) {
              rankItem.classList.add('third');
          }

          // Encontrar o usuário correspondente ao quizProgress
          const user = validData.find(user => user.quizProgress.data.includes(item));

          rankItem.innerHTML = `
              <span>#${index + 1}</span>
              <p>${item.name || 'Anônimo'}</p>
              <p>${item.score}/5</p>
              <p class="seg">${item.timing.toFixed(2)} seg</p>
          `;
          rankingContainer.appendChild(rankItem);

          // Enviar o ID do usuário para a página pai
          sendIdToParent(user.id);

          // Exibir a posição no ranking no console
          console.log(`ID: ${user.id}, Posição no ranking: #${index + 1}`);
      });
  }

  // Função para enviar o ID para a página pai
  function sendIdToParent(id) {
      window.parent.postMessage({ type: 'SEND_ID', id: id }, '*');
  }

  // Função para receber mensagens da página pai
  window.addEventListener('message', (event) => {
      if (event.data.type === 'USER_INFO') {
          const name = event.data.name;
          const email = event.data.email;
          console.log(`Recebido nome do usuário: ${name}`);
          console.log(`Recebido email do usuário: ${email}`);

          // Atualizar o ranking com o nome e o email do usuário
          updateRankingWithUserInfo(name, email);
      }
  });

  // Função para atualizar o ranking com o nome e o email do usuário
  function updateRankingWithUserInfo(name, email) {
      // Atualize o ranking com o nome e o email do usuário
      // Este é um exemplo simples, você pode adaptar conforme necessário
      const rankingContainer = document.getElementById('ranking-container');
      const rankItem = rankingContainer.querySelector('.rank-item');
      if (rankItem) {
          rankItem.querySelector('p').textContent = name || 'Anônimo';
      }
  }

  fetchData();
});