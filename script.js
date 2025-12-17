document.addEventListener('DOMContentLoaded', () => {
    
    // --- VARIABLES ---
    const quizContainer = document.getElementById('quiz-container');
    const submitQuiz = document.getElementById('submit-quiz-btn');
    const modalStep1 = document.getElementById('forum-modal-step1');
    const modalStep2 = document.getElementById('forum-modal-step2');
    const createSubjectBtn = document.getElementById('create-subject-btn');
    let selectedSubject = "";
 
    // --- NAVIGATION ---
    function navigateTo(targetId) {
       document.querySelectorAll('.page-section').forEach(section => {
           section.classList.remove('active-section');
        });
 
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
           targetSection.classList.add('active-section');
           window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
           if(targetId !== 'accueil') navigateTo('accueil');
        }
 
        document.querySelectorAll('.sidebar-link').forEach(link => {
           link.classList.remove('active-link');
            if (targetId.startsWith(link.getAttribute('data-navigate'))) {
               link.classList.add('active-link');
            }
        });
    }
 
   document.body.addEventListener('click', (e) => {
        const link = e.target.closest('[data-navigate]');
        if (link) {
           e.preventDefault();
           navigateTo(link.getAttribute('data-navigate'));
        }
    });
 
    // --- RECHERCHE ---
    const searchBtn = document.getElementById('search-button');
    const searchInp = document.getElementById('search-input');
    if(searchBtn) {
       searchBtn.addEventListener('click', () => {
            const val = searchInp.value.toLowerCase();
            if (val.includes('math') || val.includes('nombre')) navigateTo('maths');
            else if (val.includes('francais')) navigateTo('francais');
            else if (val.includes('histoire')) navigateTo('histoire');
            else if (val.includes('science')) navigateTo('sciences');
            else alert("Essaie : maths, français, histoire...");
        });
    }
 
    // --- QUIZ (15 Questions + Aléatoire + Stats) ---
    const quizData = [
        {q:"4 x 8 ?", o:["32","24","36"], a:0, r:"4x8=32"}, {q:"Capitale France ?", o:["Lyon","Paris"], a:1, r:"Paris"},
        {q:"3 + 3 x 2 ?", o:["12","9"], a:1, r:"Priorité multiplication"}, {q:"Verbe être futur ?", o:["serai","suis"], a:0, r:"Je serai"},
        {q:"1h en min ?", o:["60","100"], a:0, r:"60 min"}, {q:"Clovis roi des ?", o:["Francs","Gaulois"], a:0, r:"Francs"},
        {q:"100 / 2 ?", o:["50","25"], a:0, r:"Moitié de 100"}, {q:"L'eau bout à ?", o:["100°C","90°C"], a:0, r:"100 degrés"},
        {q:"7 x 7 ?", o:["49","42"], a:0, r:"49"}, {q:"Pluriel de 'Nez' ?", o:["Nez","Nezs"], a:0, r:"Invariable"},
       {q:"Opposé de 'Grand' ?", o:["Petit","Haut"], a:0, r:"Petit"}, {q:"Louis XIV est ?", o:["Roi Soleil","Roi Lune"], a:0, r:"Soleil"},
        {q:"1kg = ?g", o:["1000","100"], a:0, r:"1000g"}, {q:"Le sang est ?", o:["Liquide","Solide"], a:0, r:"Liquide"},
        {q:"3 x 3 ?", o:["9","6"], a:0, r:"9"}, {q:"Paris est en ?", o:["France","Espagne"], a:0, r:"France"},
        {q:"Le ciel est ?", o:["Bleu","Vert"], a:0, r:"Bleu"}, {q:"50 + 50 ?", o:["100","200"], a:0, r:"100"},
        {q:"Un carré a ?", o:["4 côtés","3 côtés"], a:0, r:"4 côtés"}, {q:"1 min = ? s", o:["60","100"], a:0, r:"60s"}
    ];
    let currentQuestions = [];
 
    function renderQuiz() {
       if(!quizContainer) return;
       updateStatsDisplay(); 
       currentQuestions = quizData.sort(() => 0.5 - Math.random()).slice(0, 15);
       quizContainer.innerHTML = currentQuestions.map((item, index) => `
            <div class="quiz-question" id="q-${index}">
               <p><strong>${index+1}.</strong> ${item.q}</p>
               ${item.o.map((opt, i) => `<label><input type="radio" name="q${index}" value="${i}"> ${opt}</label>`).join('')}
               <div class="correction-rationale"></div>
           </div>
        `).join('');
       document.getElementById('quiz-result').classList.add('notification-hidden');
       submitQuiz.textContent = "Valider mes réponses";
       submitQuiz.onclick = checkQuiz;
        submitQuiz.style.display = 'inline-block';
    }
 
    function checkQuiz() {
        let score = 0;
        let allAnswered = true;
       currentQuestions.forEach((item, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const div = document.getElementById(`q-${index}`);
            const rationale = div.querySelector('.correction-rationale');
           div.classList.remove('correct', 'incorrect');
           rationale.style.display = 'block';
           if(selected) {
               if(parseInt(selected.value) === item.a) {
                   score++;
                   div.classList.add('correct');
                   rationale.innerHTML = `✅ Correct ! (${item.r})`;
                } else {
                   div.classList.add('incorrect');
                   rationale.innerHTML = `❌ Faux. (${item.r})`;
                }
            } else { allAnswered = false; }
        });
 
       if(!allAnswered) { alert("Répondez à tout !"); return; }
       saveScore(score);
       document.getElementById('score-text').textContent = `Note : ${score} / 15`;
       document.getElementById('quiz-result').classList.remove('notification-hidden');
       submitQuiz.textContent = "Recommencer (Nouveau tirage)";
       submitQuiz.onclick = renderQuiz;
       updateStatsDisplay();
    }
 
    function saveScore(score) {
        let history = JSON.parse(localStorage.getItem('quizHistory')) || [];
       history.push(score);
       localStorage.setItem('quizHistory', JSON.stringify(history));
    }
    
    function updateStatsDisplay() {
        const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
       if(history.length === 0) return;
        const sum = history.reduce((a, b) => a + b, 0);
        const avg = (sum / history.length).toFixed(1);
        const best = Math.max(...history);
        document.getElementById('stat-total').textContent = history.length;
       document.getElementById('stat-average').textContent = `${avg}/15`;
       document.getElementById('stat-best').textContent = `${best}/15`;
        const barsContainer = document.getElementById('chart-bars-area');
       if(barsContainer) {
           barsContainer.innerHTML = '';
           history.slice(-5).forEach(s => {
                let h = (s / 15) * 100;
                let bar = document.createElement('div');
                bar.className = 'stat-bar';
               bar.style.height = h + "%";
               bar.style.backgroundColor = s >= 10 ? "#28a745" : "#dc3545";
               bar.title = `Score: ${s}/15`;
               barsContainer.appendChild(bar);
            });
        }
    }
    
    const statsBtn = document.getElementById('show-stats-btn');
    if(statsBtn) statsBtn.onclick = () => {
        const pan = document.getElementById('quiz-stats-container');
       pan.style.display = pan.style.display === 'none' ? 'block' : 'none';
       updateStatsDisplay();
    };
    if(submitQuiz) renderQuiz();
 
    // --- DÉFI DU JOUR ---
    const cm2Questions = [
        {q: "Capitale de la France ?", a: "paris"},
        {q: "20 + 20 ?", a: "40"},
        {q: "Animal qui aboie ?", a: "chien"},
        {q: "Combien font 8 x 7 ?", a: "56"},
        {q: "Pluriel de cheval ?", a: "chevaux"},
        {q: "Planète la plus proche du soleil ?", a: "mercure"},
        {q: "Roi soleil ?", a: "louis xiv"},
        {q: "1 mètre en centimètres ?", a: "100"},
        {q: "Verbe manger au futur (je) ?", a: "mangerai"},
        {q: "Nom de notre galaxie ?", a: "voie lactée"},
        {q: "Combien de côtés a un hexagone ?", a: "6"},
        {q: "Qui a découvert l'Amérique en 1492 ?", a: "christophe colomb"},
        {q: "L'eau gèle à combien de degrés ?", a: "0"},
        {q: "Féminin de 'beau' ?", a: "belle"},
        {q: "Moitié de 250 ?", a: "125"},
        {q: "Capitale de l'Angleterre ?", a: "londres"},
        {q: "Couleur du mélange bleu + jaune ?", a: "vert"},
        {q: "Combien de régions en France métropolitaine ?", a: "13"},
        {q: "500 divisé par 10 ?", a: "50"},
        {q: "Contraire de 'rapide' ?", a: "lent"},
        {q: "Le soleil est une... ?", a: "étoile"},
        {q: "Date armistice première guerre mondiale ?", a: "11 novembre"},
        {q: "Résultat de 100 - 35 ?", a: "65"},
        {q: "Quel organe pompe le sang ?", a: "coeur"},
        {q: "1 heure et demie en minutes ?", a: "90"},
        {q: "Participe passé du verbe prendre ?", a: "pris"},
        {q: "Qui a peint la Joconde (prénom seulement) ?", a: "leonard"},
        {q: "Nombre de jours dans une année bissextile ?", a: "366"},
        {q: "Pays du drapeau tricolore vert blanc rouge ?", a: "italie"},
        {q: "Triple de 15 ?", a: "45"}
    ];

    function normalize(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
    
    // Calcul du jour unique (Index)
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); 
    const todayIndex = dayIndex % cm2Questions.length; 
    const todayQ = cm2Questions[todayIndex];
    
    const defiTitle = document.getElementById('defi-question-text');
    if(defiTitle) defiTitle.textContent = todayQ.q;
    const defiBtn = document.getElementById('valider-defi-btn');
    const defiInput = document.getElementById('defi-user-answer');
    const feedbackBox = document.getElementById('defi-feedback');
    const myScoreEl = document.getElementById('my-defi-score');
    let userDefiScore = parseInt(localStorage.getItem('userDefiScore')) || 12;
    if(myScoreEl) myScoreEl.textContent = userDefiScore;

    // --- LOGIQUE VERROUILLAGE JOURNALIER (PERSISTANT) ---
    function checkDailyAvailability() {
        const lastPlayedDay = localStorage.getItem('lastDefiPlayedDay');
        if (lastPlayedDay && parseInt(lastPlayedDay) === dayIndex) {
            defiInput.disabled = true;
            defiBtn.disabled = true;
            document.getElementById('already-played-msg').style.display = 'block';
            defiBtn.textContent = "Déjà fait ✅";
            defiBtn.style.backgroundColor = "#ccc";
            defiBtn.style.cursor = "not-allowed";
        } else {
            defiInput.disabled = false;
            defiBtn.disabled = false;
            document.getElementById('already-played-msg').style.display = 'none';
            defiBtn.textContent = "Valider";
            defiBtn.style.backgroundColor = ""; 
            defiBtn.style.cursor = "pointer";
        }
    }
    checkDailyAvailability();

    // --- CLASSEMENT DYNAMIQUE ---
    const fakeUsers = [
        { name: "MathsKing", score: 30 },
        { name: "Léa_92", score: 28 },
        { name: "Hugo_B", score: 25 },
        { name: "SuperEleve", score: 22 },
        { name: "Léo_CM2", score: 20 },
        { name: "Chloé_Sci", score: 18 },
        { name: "Tom_Hist", score: 15 },
        { name: "Inès_Fr", score: 14 }
    ];

    function updateRanking() {
        const allUsers = [...fakeUsers];
        allUsers.push({ name: "Toi (Utilisateur)", score: userDefiScore, isMe: true });
        allUsers.sort((a, b) => b.score - a.score);

        const podiumContainer = document.getElementById('dynamic-podium');
        const rankingList = document.getElementById('dynamic-ranking-list');
        
        if (!podiumContainer || !rankingList) return;

        podiumContainer.innerHTML = '';
        rankingList.innerHTML = '';

        if(allUsers[1]) createPodiumStep(podiumContainer, allUsers[1], 'silver', 2, '🥈');
        if(allUsers[0]) createPodiumStep(podiumContainer, allUsers[0], 'gold', 1, '🥇');
        if(allUsers[2]) createPodiumStep(podiumContainer, allUsers[2], 'bronze', 3, '🥉');

        for (let i = 3; i < allUsers.length; i++) {
            const u = allUsers[i];
            const li = document.createElement('li');
            if (u.isMe) {
                li.classList.add('user-highlight');
            }
            li.innerHTML = `
                <span class="rank">${i + 1}.</span> 
                <span class="user">${u.name}</span> 
                <span class="pts">${u.score} pts</span>
            `;
            rankingList.appendChild(li);
        }
    }

    function createPodiumStep(container, user, typeClass, rankNum, emoji) {
        const div = document.createElement('div');
        div.className = `podium-step ${typeClass}`;
        let crownHtml = typeClass === 'gold' ? '<div class="crown">👑</div>' : '';
        let userClass = user.isMe ? 'style="color:#007bff; font-weight:900;"' : ''; 
        div.innerHTML = `
            ${crownHtml}
            <div class="avatar">${emoji}</div>
            <div class="name" ${userClass}>${user.name}</div>
            <div class="points">${user.score} pts</div>
            <div class="step-block">${rankNum}</div>
        `;
        container.appendChild(div);
    }
    updateRanking();

    // --- HISTORIQUE DÉFI (CORRECTION SUPPRIMÉE DU LISTING) ---
    function renderDefiHistory() {
        const historyList = document.getElementById('defi-history-list');
        const historyData = JSON.parse(localStorage.getItem('defiHistory')) || [];
        if(!historyList) return;

        const uniqueHistory = [];
        const seenQuestions = new Set();
        
        historyData.slice().reverse().forEach(item => {
            if (!seenQuestions.has(item.question)) {
                uniqueHistory.push(item);
                seenQuestions.add(item.question);
            }
        });

        historyList.innerHTML = '';
        uniqueHistory.slice(0, 5).forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            const statusClass = item.success ? 'badge-success' : 'badge-fail';
            const statusText = item.success ? 'Gagné' : 'Perdu';
            
            // J'ai supprimé la correction rouge ICI comme demandé
            li.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span class="history-date">📅 ${item.date || 'Date inconnue'}</span>
                    <span>${item.question}</span>
                </div>
                <span class="history-badge ${statusClass}">${statusText}</span>
            `;
            historyList.appendChild(li);
        });
        
        if(uniqueHistory.length === 0) {
            historyList.innerHTML = '<li style="color:#999; padding:10px;">Aucun défi relevé pour l\'instant.</li>';
        }
    }

    function addToHistory(questionText, isSuccess, rightAnswer) {
        let historyData = JSON.parse(localStorage.getItem('defiHistory')) || [];
        historyData.push({
            question: questionText,
            success: isSuccess,
            date: new Date().toLocaleDateString(),
            correctAnswer: rightAnswer
        });
        localStorage.setItem('defiHistory', JSON.stringify(historyData));
        renderDefiHistory();
    }
    renderDefiHistory();

    // --- CLICK VALIDER DEFI ---
    if(defiBtn) {
       defiBtn.addEventListener('click', () => {
            const userRep = normalize(defiInput.value);
            const correctRep = normalize(todayQ.a);
            feedbackBox.classList.remove('feedback-hidden', 'feedback-success', 'feedback-error');
            
            let isWin = false;

            if (userRep === correctRep) {
               feedbackBox.textContent = "✅ Bravo ! Bonne réponse (+1 pt)";
               feedbackBox.classList.add("feedback-bubble", "feedback-success");
               triggerConfetti();
               userDefiScore++;
               localStorage.setItem('userDefiScore', userDefiScore);
               if(myScoreEl) myScoreEl.textContent = userDefiScore;
               isWin = true;
            } else {
               feedbackBox.innerHTML = `❌ Faux ! Pour la question "<em>${todayQ.q}</em>", la réponse était : <strong>${todayQ.a}</strong>`;
               feedbackBox.classList.add("feedback-bubble", "feedback-error");
               isWin = false;
            }
            
            // Sauvegarde
            addToHistory(todayQ.q, isWin, todayQ.a);

            localStorage.setItem('lastDefiPlayedDay', dayIndex);
            checkDailyAvailability(); 
            updateRanking();
        });
    }
 
    // --- CONFETTI ---
    function triggerConfetti() {
        const container = document.getElementById('confetti-container');
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
           c.classList.add('confetti');
           c.style.left = Math.random() * 100 + 'vw';
           c.style.background = `hsl(${Math.random()*360}, 100%, 50%)`;
           c.style.animationDuration = (Math.random() * 2 + 2) + 's';
           container.appendChild(c);
           setTimeout(() => c.remove(), 4000);
        }
    }
 
    // --- FORUM & CONTRIBUTION ---
    if(createSubjectBtn) createSubjectBtn.onclick = () => modalStep1.style.display = 'flex';
    window.closeAllModals = function() { document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none'); };
 
    document.querySelectorAll('.select-subject-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           selectedSubject = btn.getAttribute('data-sub');
            const className = btn.getAttribute('data-class');
           modalStep1.style.display = 'none';
            modalStep2.style.display = 'flex';
           document.getElementById('forum-selected-info').textContent = `Sujet en : ${selectedSubject}`;
           document.getElementById('forum-selected-info').className = className;
        });
    });
 
    const publishBtn = document.getElementById('publish-forum-btn');
    if(publishBtn) {
       publishBtn.addEventListener('click', () => {
            const title = document.getElementById('new-post-title').value;
            const body = document.getElementById('new-post-body').value;
            const isAnon = document.getElementById('anon-check').checked;
            if(!title || !body) { alert("Remplissez tout !"); return; }
            const now = new Date();
            const time = `${now.getHours()}:${now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes()}`;
            const author = isAnon ? "Anonyme" : "Moi";
            let tagClass = "math"; 
           if(selectedSubject === "Histoire") tagClass = "history";
           if(selectedSubject === "Sciences") tagClass = "science";
           if(selectedSubject === "Français") tagClass = "francais";
 
            const html = `
            <div class="forum-card">
               <div class="forum-icon">📝</div>
               <div class="forum-content">
                   <div class="forum-header">
                       <span class="tag-subject ${tagClass}">${selectedSubject}</span>
                        <span class="forum-date">Aujourd'hui ${time}</span>
                   </div>
                   <h4>${title}</h4>
                   <p>${body}</p>
                   <div class="replies-container"></div>
                   <div class="reply-action-area">
                       <button class="reply-btn-small trigger-reply">↩️ Répondre</button>
                       <div class="reply-input-box" style="display: none;">
                           <textarea placeholder="Ta réponse..."></textarea>
                            <button class="nav-button-small send-reply">Envoyer</button>
                       </div>
                   </div>
                   <div class="forum-footer">
                       <span>Par <strong>${author}</strong></span>
                   </div>
               </div>
           </div>`;
           document.getElementById('forum-posts-container').insertAdjacentHTML('afterbegin', html);
           modalStep2.style.display = 'none';
           attachReplyEvents(); // Réattacher les événements aux nouveaux boutons
        });
    }
 
    const contribForm = document.getElementById('contribution-form');
    if(contribForm) {
       contribForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('contributor-email').value;
            const popup = document.getElementById('notification-popup');
           popup.innerHTML = `<p>✅ Bien reçu ! Une réponse vous sera envoyée à <strong>${email}</strong>.</p>`;
           popup.classList.remove('notification-hidden');
           setTimeout(() => popup.classList.add('notification-hidden'), 4000);
           contribForm.reset();
        });
    }
 
    // --- GESTION REPONSES FORUM ---
    function attachReplyEvents() {
       document.querySelectorAll('.trigger-reply').forEach(btn => {
            // Evite les doublons d'écouteurs
           btn.onclick = null;
           btn.onclick = function() {
                const box = this.nextElementSibling;
               box.style.display = box.style.display === 'none' ? 'flex' : 'none';
            };
        });
 
       document.querySelectorAll('.send-reply').forEach(btn => {
           btn.onclick = null;
           btn.onclick = function() {
                const textarea = this.previousElementSibling;
                const text = textarea.value;
               if(text) {
                   const container = this.closest('.forum-content').querySelector('.replies-container');
                   container.innerHTML += `<div class="reply-display-box"><strong>Moi :</strong> ${text}</div>`;
                   textarea.value = '';
                   this.closest('.reply-input-box').style.display = 'none';
                }
            };
        });
    }
   attachReplyEvents(); // Initial
 
    // --- UTILS (MODIFIÉ: SCROLL AUTOMATIQUE VERS EXOS) ---
    window.toggleMode = function(btn, mode) {
        const section = btn.closest('.page-section');
       section.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active-mode'));
       btn.classList.add('active-mode');
       section.querySelectorAll('.content-mode').forEach(c => c.classList.remove('active-mode'));
       const targetMode = section.querySelector('.'+mode+'-mode');
       targetMode.classList.add('active-mode');

       // SCROLL AUTOMATIQUE SI C'EST LES EXERCICES
       if (mode === 'exercice') {
           targetMode.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }
    }
    
   document.querySelectorAll('.show-answer-btn').forEach(btn => {
        btn.onclick = function() {
            const sol = this.nextElementSibling;
           sol.style.display = sol.style.display === 'block' ? 'none' : 'block';
        }
    });
 
    // Compte à rebours
    setInterval(() => {
        const now = new Date();
        const midnight = new Date(now);
       midnight.setHours(24,0,0,0);
        const diff = midnight - now;
        const h = Math.floor(diff/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        const el = document.getElementById('countdown');
        if(el) el.innerText = `${h}h ${m}m ${s}s`;
    }, 1000);
 
});
