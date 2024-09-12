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
        console.log('Dados válidos:', validData);

        if (validData.length > 0) {
            // Extrair e combinar todos os dados de quizProgress
            const allQuizProgress = validData.flatMap(item => item.quizProgress.data.map(quiz => ({
                ...quiz,
                name: item.name // Adicionar o nome do usuário ao objeto quiz
            })));

            // Ordenar os dados de quizProgress
            const rankedQuizProgress = allQuizProgress.sort((a, b) => {
              if (b.score === a.score) {
                return a.timing - b.timing; // Menor tempo primeiro em caso de empate na pontuação
              }
              return b.score - a.score; // Maior pontuação primeiro
            }).slice(0, 10); // Limitar aos 10 melhores resultados

            console.log('Rankeamento de quizProgress:', rankedQuizProgress);
            updateRanking(rankedQuizProgress); // Passar os dados rankeados
        } else {
            console.warn('Nenhum dado de quizProgress encontrado.');
        }
      }
  }
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'USER_INFO') {
        const user = event.data.user;
        console.log('Dados do usuário recebidos no iframe:', user);
  
        // Atualizar a interface do iframe com os dados do usuário
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
      }else{
        console.log('Mensagem recebida:', event.data);
        console.log('Tipo de mensagem não reconhecido:', event.data.type);
      }
    });
  });
  // Função para atualizar o ranking na interface do usuário
  function updateRanking(rankedQuizProgress) {
    const rankingContainer = document.getElementById('rankingContainer');
    rankingContainer.innerHTML = ''; // Limpar o conteúdo anterior

    rankedQuizProgress.forEach((quiz, index) => {
      const rankItem = document.createElement('div');
      rankItem.className = 'rank-item';
      rankItem.innerHTML = `
        <div class="rank-position">${index + 1}</div>
        <div class="rank-name">${quiz.name}</div>
        <div class="rank-score">${quiz.score}</div>
        <div class="rank-timing">${quiz.timing}</div>
      `;
      rankingContainer.appendChild(rankItem);
    });
  }

  fetchData();
});

// Função para enviar dados para o iframe
function sendUserInfoToIframe(user) {
    const iframe = document.getElementById('quizIframe');
    if (iframe) {
        iframe.contentWindow.postMessage({
            type: 'USER_INFO',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }, '*');
    } else {
        console.error('Iframe não encontrado.');
    }
}

// Função para receber mensagens do iframe
window.addEventListener('message', async (event) => {
    if (event.data.type === 'SEND_ID') {
        const id = event.data.id;
        console.log(`Recebido ID do iframe: ${id}`);

        // Verifique se o ID é válido
        if (!id || id === 'ID não encontrado') {
            console.error('ID inválido recebido do iframe.');
            return;
        }

        // Definir os tokens necessários
        const developerToken = 'ec5dd35e-35df-4053-99de-27eb38d29225';
        const platformToken = 'c525ab94-793e-4fc1-971a-bc0a66b7f58f';

        const user = await fetchUserById(id, developerToken, platformToken);
        if (user) {
            console.log(`Nome do usuário: ${user.name}`);
            console.log(`Email do usuário: ${user.email}`);

            // Enviar o nome, email e ID de volta para o iframe
            sendUserInfoToIframe(user);
        }
    }
});