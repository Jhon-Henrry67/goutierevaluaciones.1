// Este archivo ya no es necesario - todo el código está integrado en index.html
// Puedes eliminar este archivo (app.js) y styles.css

function initializeApp() {
    loadData();
    setupEventListeners();
    checkSession();
    initializeSignaturePads();
}

function loadData() {
    const savedEvaluaciones = localStorage.getItem('evaluaciones_hospital');
    const savedProfesores = localStorage.getItem('profesores_hospital');
    
    if (savedEvaluaciones) {
        AppState.evaluaciones = JSON.parse(savedEvaluaciones);
    }
    
    if (savedProfesores) {
        AppState.profesores = JSON.parse(savedProfesores);
    }
}

function saveData() {
    localStorage.setItem('evaluaciones_hospital', JSON.stringify(AppState.evaluaciones));
    localStorage.setItem('profesores_hospital', JSON.stringify(AppState.profesores));
}

function checkSession() {
    const savedSession = localStorage.getItem('current_profesor');
    if (savedSession) {
        AppState.currentProfesor = JSON.parse(savedSession);
        showScreen('dashboardScreen');
        updateDashboard();
    } else {
        showScreen('loginScreen');
    }
}

function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // New Evaluation
    document.getElementById('newEvalBtn').addEventListener('click', () => {
        resetEvaluationForm();
        showScreen('evaluationScreen');
    });
    
    // Back to Dashboard
    document.getElementById('backToDashboard').addEventListener('click', () => {
        showScreen('dashboardScreen');
    });
    
    // Cancel Button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        if (confirm('¿Está seguro que desea cancelar? Los cambios no guardados se perderán.')) {
            showScreen('dashboardScreen');
        }
    });
    
    // Preview Button
    document.getElementById('previewBtn').addEventListener('click', showPreview);
    
    // Evaluation Form
    document.getElementById('evaluacionForm').addEventListener('submit', handleSubmitEvaluation);
    
    // Print from Preview
    document.getElementById('printFromPreview').addEventListener('click', () => {
        if (AppState.currentEvaluation) {
            generatePDF(AppState.currentEvaluation, true);
        }
    });
    
    // Print from View
    document.getElementById('printFromView').addEventListener('click', () => {
        if (AppState.currentEvaluation) {
            generatePDF(AppState.currentEvaluation, true);
        }
    });
    
    // Search and Filter
    document.getElementById('searchEstudiante').addEventListener('input', filterEvaluaciones);
    document.getElementById('filterTrimestre').addEventListener('change', filterEvaluaciones);
    
    // Calculate scores on radio change
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', calculateScores);
    });
    
    // Estudiante name sync with firma
    document.getElementById('estNombre').addEventListener('input', (e) => {
        document.getElementById('nombreFirmaEstudiante').value = 
            e.target.value + ' ' + (document.getElementById('estApellido').value || '');
    });
    
    document.getElementById('estApellido').addEventListener('input', (e) => {
        document.getElementById('nombreFirmaEstudiante').value = 
            (document.getElementById('estNombre').value || '') + ' ' + e.target.value;
    });
}

function initializeSignaturePads() {
    // Profesor signature pad
    const canvasProf = document.getElementById('firmaProfesor');
    if (canvasProf) {
        AppState.firmaProfesorPad = new SignaturePad(canvasProf, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(0, 0, 0)'
        });
        
        canvasProf.addEventListener('mousedown', () => {
            canvasProf.classList.add('active');
        });
        canvasProf.addEventListener('touchstart', () => {
            canvasProf.classList.add('active');
        });
    }
    
    // Estudiante signature pad
    const canvasEst = document.getElementById('firmaEstudiante');
    if (canvasEst) {
        AppState.firmaEstudiantePad = new SignaturePad(canvasEst, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(0, 0, 0)'
        });
        
        canvasEst.addEventListener('mousedown', () => {
            canvasEst.classList.add('active');
        });
        canvasEst.addEventListener('touchstart', () => {
            canvasEst.classList.add('active');
        });
    }
}

// Simple Signature Pad implementation
class SignaturePad {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.points = [];
        this.backgroundColor = options.backgroundColor || 'rgba(255, 255, 255, 0)';
        this.penColor = options.penColor || 'rgb(0, 0, 0)';
        
        // Set canvas size
        this.resize();
        
        // Bind events
        this.bindEvents();
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.penColor;
    }
    
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.points.push({x, y});
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.points.push({x, y});
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.ctx.closePath();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
    }
    
    isEmpty() {
        return this.points.length === 0;
    }
    
    toDataURL() {
        return this.canvas.toDataURL();
    }
    
    fromDataURL(dataURL) {
        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
    }
}

function clearFirma(canvasId) {
    if (canvasId === 'firmaProfesor' && AppState.firmaProfesorPad) {
        AppState.firmaProfesorPad.clear();
    } else if (canvasId === 'firmaEstudiante' && AppState.firmaEstudiantePad) {
        AppState.firmaEstudiantePad.clear();
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('profesorNombre').value;
    const email = document.getElementById('profesorEmail').value;
    
    AppState.currentProfesor = {
        id: Date.now(),
        nombre,
        email,
        fechaRegistro: new Date().toISOString()
    };
    
    // Save profesor to list if new
    const existingIndex = AppState.profesores.findIndex(p => p.email === email);
    if (existingIndex === -1) {
        AppState.profesores.push(AppState.currentProfesor);
        saveData();
    }
    
    localStorage.setItem('current_profesor', JSON.stringify(AppState.currentProfesor));
    
    document.getElementById('currentProfesor').textContent = nombre;
    document.getElementById('nombreFirmaProfesor').value = nombre;
    
    showScreen('dashboardScreen');
    updateDashboard();
    showToast('Bienvenido al sistema', 'success');
}

function handleLogout() {
    localStorage.removeItem('current_profesor');
    AppState.currentProfesor = null;
    showScreen('loginScreen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function updateDashboard() {
    // Update stats
    document.getElementById('totalEstudiantes').textContent = 
        [...new Set(AppState.evaluaciones.map(e => e.estudianteId))].length;
    document.getElementById('totalEvaluaciones').textContent = AppState.evaluaciones.length;
    document.getElementById('totalProfesores').textContent = AppState.profesores.length;
    
    // Render evaluaciones
    renderEvaluaciones(AppState.evaluaciones);
}

function renderEvaluaciones(evaluaciones) {
    const grid = document.getElementById('evaluacionesGrid');
    
    if (evaluaciones.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-clipboard-list"></i>
                <h3>No hay evaluaciones registradas</h3>
                <p>Haga clic en "Nueva Evaluación" para comenzar</p>
            </div>
        `;
        return;
    }
    
    // Sort by date, newest first
    const sortedEvals = [...evaluaciones].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
    );
    
    grid.innerHTML = sortedEvals.map(eval => createEvalCard(eval)).join('');
}

function createEvalCard(eval) {
    const fecha = new Date(eval.fecha).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const promedio = eval.promedio.toFixed(1);
    let scoreClass = '';
    if (promedio >= 3.5) scoreClass = 'score-excellent';
    else if (promedio >= 3.0) scoreClass = 'score-good';
    else if (promedio >= 2.0) scoreClass = 'score-average';
    else scoreClass = 'score-poor';
    
    const trimestreText = {
        '1': '1er Trimestre',
        '2': '2do Trimestre',
        '3': '3er Trimestre',
        '4': '4to Trimestre'
    }[eval.trimestre] || 'Trimestre ' + eval.trimestre;
    
    return `
        <div class="eval-card" onclick="viewEvaluation(${eval.id})">
            <div class="eval-card-header">
                <h4>${eval.estudianteNombre} ${eval.estudianteApellido}</h4>
                <p>${trimestreText} - Año ${eval.anio}</p>
            </div>
            <div class="eval-card-body">
                <div class="eval-card-info">
                    <span><i class="fas fa-calendar"></i> ${fecha}</span>
                    <span><i class="fas fa-user-md"></i> ${eval.profesorNombre}</span>
                    <span><i class="fas fa-graduation-cap"></i> R${eval.anio}</span>
                </div>
                <div class="eval-card-stats">
                    <div class="eval-stat">
                        <div class="eval-stat-value ${scoreClass}">${promedio}</div>
                        <div class="eval-stat-label">Promedio</div>
                    </div>
                    <div class="eval-stat">
                        <div class="eval-stat-value">${eval.totalScore}/96</div>
                        <div class="eval-stat-label">Puntuación</div>
                    </div>
                </div>
            </div>
            <div class="eval-card-footer">
                <span class="eval-profesor">Evaluado por: ${eval.profesorNombre}</span>
                <div class="eval-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-icon" onclick="generatePDFById(${eval.id})" title="Descargar PDF">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-icon" onclick="deleteEvaluation(${eval.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function filterEvaluaciones() {
    const searchTerm = document.getElementById('searchEstudiante').value.toLowerCase();
    const trimestre = document.getElementById('filterTrimestre').value;
    
    let filtered = AppState.evaluaciones;
    
    if (searchTerm) {
        filtered = filtered.filter(e => 
            (e.estudianteNombre + ' ' + e.estudianteApellido).toLowerCase().includes(searchTerm)
        );
    }
    
    if (trimestre) {
        filtered = filtered.filter(e => e.trimestre === trimestre);
    }
    
    renderEvaluaciones(filtered);
}

function resetEvaluationForm() {
    document.getElementById('evaluacionForm').reset();
    clearFirma('firmaProfesor');
    clearFirma('firmaEstudiante');
    document.getElementById('totalScore').textContent = '0';
    document.getElementById('averageScore').textContent = '0.0';
    document.getElementById('resultadoText').textContent = '-';
    
    // Reset canvas active states
    document.querySelectorAll('.firma-canvas').forEach(c => c.classList.remove('active'));
    
    // Set profesor name
    if (AppState.currentProfesor) {
        document.getElementById('nombreFirmaProfesor').value = AppState.currentProfesor.nombre;
    }
}

function calculateScores() {
    const scores = [];
    const form = document.getElementById('evaluacionForm');
    const radioGroups = [
        'cuidado_a', 'cuidado_b', 'cuidado_c', 'cuidado_d', 'cuidado_e',
        'aprendizaje_a', 'aprendizaje_b', 'aprendizaje_c',
        'destreza_a', 'destreza_b', 'destreza_c', 'destreza_d', 'destreza_e',
        'capacidad_a', 'capacidad_b', 'capacidad_c', 'capacidad_d', 'capacidad_e',
        'actitud_a', 'actitud_b', 'actitud_c', 'actitud_d', 'actitud_e', 'actitud_f'
    ];
    
    radioGroups.forEach(group => {
        const selected = form.querySelector(`input[name="${group}"]:checked`);
        if (selected) {
            scores.push(parseInt(selected.value));
        }
    });
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length > 0 ? total / scores.length : 0;
    
    document.getElementById('totalScore').textContent = total;
    document.getElementById('averageScore').textContent = average.toFixed(1);
    
    // Determine resultado
    let resultado = '-';
    if (scores.length === radioGroups.length) {
        if (average >= 3.5) resultado = 'EXCELENTE';
        else if (average >= 3.0) resultado = 'BUENO';
        else if (average >= 2.5) resultado = 'REGULAR';
        else if (average >= 2.0) resultado = 'NECESITA MEJORAR';
        else resultado = 'INSUFICIENTE';
    }
    
    document.getElementById('resultadoText').textContent = resultado;
}

function handleSubmitEvaluation(e) {
    e.preventDefault();
    
    // Validate signatures
    if (AppState.firmaProfesorPad.isEmpty()) {
        showToast('Por favor, firme como profesor', 'error');
        return;
    }
    
    if (AppState.firmaEstudiantePad.isEmpty()) {
        showToast('Por favor, solicite la firma del estudiante', 'error');
        return;
    }
    
    // Collect all scores
    const scores = {};
    const radioGroups = [
        'cuidado_a', 'cuidado_b', 'cuidado_c', 'cuidado_d', 'cuidado_e',
        'aprendizaje_a', 'aprendizaje_b', 'aprendizaje_c',
        'destreza_a', 'destreza_b', 'destreza_c', 'destreza_d', 'destreza_e',
        'capacidad_a', 'capacidad_b', 'capacidad_c', 'capacidad_d', 'capacidad_e',
        'actitud_a', 'actitud_b', 'actitud_c', 'actitud_d', 'actitud_e', 'actitud_f'
    ];
    
    for (const group of radioGroups) {
        const selected = document.querySelector(`input[name="${group}"]:checked`);
        if (!selected) {
            showToast(`Por complete la sección ${group.split('_')[0].toUpperCase()}`, 'error');
            return;
        }
        scores[group] = parseInt(selected.value);
    }
    
    const estudianteNombre = document.getElementById('estNombre').value;
    const estudianteApellido = document.getElementById('estApellido').value;
    
    const evaluacion = {
        id: Date.now(),
        estudianteId: estudianteNombre.toLowerCase().replace(/\s/g, '_') + '_' + estudianteApellido.toLowerCase().replace(/\s/g, '_'),
        estudianteNombre,
        estudianteApellido,
        anio: document.getElementById('estAnio').value,
        trimestre: document.getElementById('estTrimestre').value,
        profesorId: AppState.currentProfesor.id,
        profesorNombre: AppState.currentProfesor.nombre,
        profesorEmail: AppState.currentProfesor.email,
        scores,
        totalScore: Object.values(scores).reduce((a, b) => a + b, 0),
        promedio: Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length,
        observaciones: document.getElementById('observaciones').value,
        firmaProfesor: AppState.firmaProfesorPad.toDataURL(),
        firmaEstudiante: AppState.firmaEstudiantePad.toDataURL(),
        fecha: new Date().toISOString()
    };
    
    // Save to storage
    AppState.evaluaciones.push(evaluacion);
    saveData();
    
    showToast('Evaluación guardada exitosamente', 'success');
    showScreen('dashboardScreen');
    updateDashboard();
    
    // Generate PDF
    generatePDF(evaluacion);
}

function viewEvaluation(id) {
    const evaluacion = AppState.evaluaciones.find(e => e.id === id);
    if (!evaluacion) return;
    
    AppState.currentEvaluation = evaluacion;
    
    const fecha = new Date(evaluacion.fecha).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const content = document.getElementById('viewContent');
    content.innerHTML = `
        <div class="preview-content">
            <div class="hospital-header" style="background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; padding: 2rem; border-radius: 12px 12px 0 0;">
                <div style="text-align: center;">
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Hospital Dr. Salvador B. Gautier</h3>
                    <p style="font-size: 1rem; opacity: 0.9;">Residencia de Emergencología y Cuidado Crítico</p>
                    <p style="font-size: 1.1rem; font-weight: 600; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.3);">Evaluación de Competencias del Residente</p>
                </div>
            </div>
            
            <div style="padding: 2rem; background: white;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div><strong>Nombre:</strong> ${evaluacion.estudianteNombre} ${evaluacion.estudianteApellido}</div>
                    <div><strong>Profesor:</strong> ${evaluacion.profesorNombre}</div>
                    <div><strong>Año Académico:</strong> R${evaluacion.anio}</div>
                    <div><strong>Trimestre:</strong> ${evaluacion.trimestre}°</div>
                    <div><strong>Fecha:</strong> ${fecha}</div>
                </div>
                
                ${createEvaluationTables(evaluacion.scores)}
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px;">
                    <h4 style="margin-bottom: 1rem;">Observaciones</h4>
                    <p>${evaluacion.observaciones || 'Sin observaciones'}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                    <div style="text-align: center;">
                        <div style="border: 1px solid #e2e8f0; padding: 1rem; margin-bottom: 0.5rem; min-height: 100px;">
                            <img src="${evaluacion.firmaProfesor}" style="max-width: 100%; max-height: 80px;">
                        </div>
                        <p style="font-weight: 600;">Firma del Profesor</p>
                        <p style="font-size: 0.9rem; color: #64748b;">${evaluacion.profesorNombre}</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="border: 1px solid #e2e8f0; padding: 1rem; margin-bottom: 0.5rem; min-height: 100px;">
                            <img src="${evaluacion.firmaEstudiante}" style="max-width: 100%; max-height: 80px;">
                        </div>
                        <p style="font-weight: 600;">Firma del Estudiante</p>
                        <p style="font-size: 0.9rem; color: #64748b;">${evaluacion.estudianteNombre} ${evaluacion.estudianteApellido}</p>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; border-radius: 12px; text-align: center;">
                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <span style="font-size: 0.9rem; opacity: 0.9;">Puntuación Total</span>
                            <div style="font-size: 2rem; font-weight: 700;">${evaluacion.totalScore} / 96</div>
                        </div>
                        <div>
                            <span style="font-size: 0.9rem; opacity: 0.9;">Promedio</span>
                            <div style="font-size: 2rem; font-weight: 700;">${evaluacion.promedio.toFixed(1)} / 4.0</div>
                        </div>
                        <div>
                            <span style="font-size: 0.9rem; opacity: 0.9;">Resultado</span>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #fbbf24;">${getResultadoText(evaluacion.promedio)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    openModal('viewModal');
}

function createEvaluationTables(scores) {
    const sections = {
        'I': {
            title: 'Cuidado del Paciente',
            items: [
                { code: 'cuidado_a', label: 'Mantenimiento de la salud y prevención de enfermedades' },
                { code: 'cuidado_b', label: 'Manejo y medidas terapéuticas' },
                { code: 'cuidado_c', label: 'Seguimiento a enfermedades recurrentes' },
                { code: 'cuidado_d', label: 'Manejo de la fisiopatología de las enfermedades' },
                { code: 'cuidado_e', label: 'Intervención clínica y manejo de diagnósticos diferenciales' }
            ]
        },
        'II': {
            title: 'Aprendizaje Basado en la Práctica',
            items: [
                { code: 'aprendizaje_a', label: 'Desempeño y Manejo del área de triaje/Naranja' },
                { code: 'aprendizaje_b', label: 'Aplicación de la información de investigación en la práctica clínica' },
                { code: 'aprendizaje_c', label: 'Entendimiento de los principios éticos y legales en medicina de emergencia' }
            ]
        },
        'III': {
            title: 'Destrezas y Habilidades',
            items: [
                { code: 'destreza_a', label: 'Destreza para explicar ideas y procedimientos tanto en forma oral y escrita' },
                { code: 'destreza_b', label: 'Realizar preguntas pertinentes al caso del paciente o dilema' },
                { code: 'destreza_c', label: 'Hacer comentarios útiles y de enseñanza' },
                { code: 'destreza_d', label: 'Diseñar buena investigación de interés científico' },
                { code: 'destreza_e', label: 'Adecuada organización y administración del tiempo' }
            ]
        },
        'IV': {
            title: 'Capacidades',
            items: [
                { code: 'capacidad_a', label: 'Pensamiento crítico y lógico' },
                { code: 'capacidad_b', label: 'Manejo del estrés' },
                { code: 'capacidad_c', label: 'Sensibilidad y empatía' },
                { code: 'capacidad_d', label: 'Resolución de problemas' },
                { code: 'capacidad_e', label: 'Manejo de expediente clínico y órdenes' }
            ]
        },
        'V': {
            title: 'Actitudes',
            items: [
                { code: 'actitud_a', label: 'Actitud positiva y dispuesto a trabajar en equipo' },
                { code: 'actitud_b', label: 'Muestra proactividad, ideas y busca soluciones en equipo' },
                { code: 'actitud_c', label: 'Escucha y respeta acatando las decisiones del equipo' },
                { code: 'actitud_d', label: 'Comunica respetando las órdenes jerárquicas ante la toma de decisiones' },
                { code: 'actitud_e', label: 'Escucha y respeta acatando las decisiones del equipo' },
                { code: 'actitud_f', label: 'Muestra mejora ante observaciones y/o correcciones previas' }
            ]
        }
    };
    
    let html = '';
    for (const [sectionNum, section] of Object.entries(sections)) {
        html += `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="background: #f1f5f9; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
                    ${sectionNum}. ${section.title}
                </h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc;">
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Ítem</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Descripción</th>
                            <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0; width: 80px;">Calificación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${section.items.map((item, idx) => `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 0.75rem;">${String.fromCharCode(65 + idx)}</td>
                                <td style="padding: 0.75rem;">${item.label}</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 700; color: ${getScoreColor(scores[item.code])};">${scores[item.code]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    return html;
}

function getScoreColor(score) {
    if (score >= 4) return '#059669';
    if (score >= 3) return '#0891b2';
    if (score >= 2) return '#d97706';
    return '#dc2626';
}

function getResultadoText(promedio) {
    if (promedio >= 3.5) return 'EXCELENTE';
    if (promedio >= 3.0) return 'BUENO';
    if (promedio >= 2.5) return 'REGULAR';
    if (promedio >= 2.0) return 'NECESITA MEJORAR';
    return 'INSUFICIENTE';
}

function showPreview() {
    // Validate required fields
    const nombre = document.getElementById('estNombre').value;
    const apellido = document.getElementById('estApellido').value;
    
    if (!nombre || !apellido) {
        showToast('Por favor complete el nombre y apellido del estudiante', 'error');
        return;
    }
    
    // Collect scores for preview
    const scores = {};
    const radioGroups = [
        'cuidado_a', 'cuidado_b', 'cuidado_c', 'cuidado_d', 'cuidado_e',
        'aprendizaje_a', 'aprendizaje_b', 'aprendizaje_c',
        'destreza_a', 'destreza_b', 'destreza_c', 'destreza_d', 'destreza_e',
        'capacidad_a', 'capacidad_b', 'capacidad_c', 'capacidad_d', 'capacidad_e',
        'actitud_a', 'actitud_b', 'actitud_c', 'actitud_d', 'actitud_e', 'actitud_f'
    ];
    
    radioGroups.forEach(group => {
        const selected = document.querySelector(`input[name="${group}"]:checked`);
        scores[group] = selected ? parseInt(selected.value) : 0;
    });
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const promedio = totalScore / 24;
    
    // Create preview evaluation object
    AppState.currentEvaluation = {
        estudianteNombre: nombre,
        estudianteApellido: apellido,
        anio: document.getElementById('estAnio').value,
        trimestre: document.getElementById('estTrimestre').value,
        profesorNombre: AppState.currentProfesor ? AppState.currentProfesor.nombre : '',
        scores,
        totalScore,
        promedio,
        observaciones: document.getElementById('observaciones').value,
        firmaProfesor: !AppState.firmaProfesorPad.isEmpty() ? AppState.firmaProfesorPad.toDataURL() : '',
        firmaEstudiante: !AppState.firmaEstudiantePad.isEmpty() ? AppState.firmaEstudiantePad.toDataURL() : '',
        fecha: new Date().toISOString()
    };
    
    const content = document.getElementById('previewContent');
    content.innerHTML = `
        <div class="preview-content">
            <div class="hospital-header" style="background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; padding: 2rem; border-radius: 12px 12px 0 0;">
                <div style="text-align: center;">
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Hospital Dr. Salvador B. Gautier</h3>
                    <p style="font-size: 1rem; opacity: 0.9;">Residencia de Emergencología y Cuidado Crítico</p>
                    <p style="font-size: 1.1rem; font-weight: 600; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.3);">Evaluación de Competencias del Residente - VISTA PREVIA</p>
                </div>
            </div>
            
            <div style="padding: 2rem; background: white;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <div><strong>Nombre:</strong> ${nombre} ${apellido}</div>
                    <div><strong>Profesor:</strong> ${AppState.currentEvaluation.profesorNombre}</div>
                    <div><strong>Año Académico:</strong> R${AppState.currentEvaluation.anio}</div>
                    <div><strong>Trimestre:</strong> ${AppState.currentEvaluation.trimestre}°</div>
                </div>
                
                ${createEvaluationTables(scores)}
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px;">
                    <h4 style="margin-bottom: 1rem;">Observaciones</h4>
                    <p>${AppState.currentEvaluation.observaciones || 'Sin observaciones'}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                    <div style="text-align: center;">
                        <div style="border: 1px solid #e2e8f0; padding: 1rem; margin-bottom: 0.5rem; min-height: 100px; display: flex; align-items: center; justify-content: center;">
                            ${AppState.currentEvaluation.firmaProfesor ? 
                                `<img src="${AppState.currentEvaluation.firmaProfesor}" style="max-width: 100%; max-height: 80px;">` : 
                                '<span style="color: #94a3b8;">Sin firma</span>'}
                        </div>
                        <p style="font-weight: 600;">Firma del Profesor</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="border: 1px solid #e2e8f0; padding: 1rem; margin-bottom: 0.5rem; min-height: 100px; display: flex; align-items: center; justify-content: center;">
                            ${AppState.currentEvaluation.firmaEstudiante ? 
                                `<img src="${AppState.currentEvaluation.firmaEstudiante}" style="max-width: 100%; max-height: 80px;">` : 
                                '<span style="color: #94a3b8;">Sin firma</span>'}
                        </div>
                        <p style="font-weight: 600;">Firma del Estudiante</p>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; border-radius: 12px; text-align: center;">
                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <span style="font-size: 0.9rem; opacity: 0.9;">Puntuación Total</span>
                            <div style="font-size: 2rem; font-weight: 700;">${totalScore} / 96</div>
                        </div>
                        <div>
                            <span style="font-size: 0.9rem; opacity: 0.9;">Promedio</span>
                            <div style="font-size: 2rem; font-weight: 700;">${promedio.toFixed(1)} / 4.0</div>
                        </div>
                        <div>
                            <span style="font-size: 0.9rem; opacity: 0.9;">Resultado</span>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #fbbf24;">${getResultadoText(promedio)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    openModal('previewModal');
}

function generatePDFById(id) {
    const evaluacion = AppState.evaluaciones.find(e => e.id === id);
    if (evaluacion) {
        generatePDF(evaluacion);
    }
}

function generatePDF(evaluacion, print = false) {
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = 216;
    const margin = 15;
    let y = margin;
    
    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Hospital Dr. Salvador B. Gautier', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Residencia de Emergencología y Cuidado Crítico', pageWidth / 2, 23, { align: 'center' });
    doc.text('Evaluación de Competencias del Residente', pageWidth / 2, 32, { align: 'center' });
    
    y = 50;
    
    // Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL RESIDENTE', margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${evaluacion.estudianteNombre} ${evaluacion.estudianteApellido}`, margin, y);
    doc.text(`Profesor Evaluador: ${evaluacion.profesorNombre}`, pageWidth / 2, y);
    y += 6;
    doc.text(`Año Académico: R${evaluacion.anio}`, margin, y);
    doc.text(`Trimestre: ${evaluacion.trimestre}°`, pageWidth / 2, y);
    y += 6;
    doc.text(`Fecha: ${new Date(evaluacion.fecha).toLocaleDateString('es-DO')}`, margin, y);
    y += 12;
    
    // Sections
    const sections = {
        'I': { title: 'Cuidado del Paciente', items: [
            { code: 'cuidado_a', label: 'Mantenimiento de la salud y prevención de enfermedades' },
            { code: 'cuidado_b', label: 'Manejo y medidas terapéuticas' },
            { code: 'cuidado_c', label: 'Seguimiento a enfermedades recurrentes' },
            { code: 'cuidado_d', label: 'Manejo de la fisiopatología de las enfermedades' },
            { code: 'cuidado_e', label: 'Intervención clínica y manejo de diagnósticos diferenciales' }
        ]},
        'II': { title: 'Aprendizaje Basado en la Práctica', items: [
            { code: 'aprendizaje_a', label: 'Desempeño y Manejo del área de triaje/Naranja' },
            { code: 'aprendizaje_b', label: 'Aplicación de la información de investigación' },
            { code: 'aprendizaje_c', label: 'Entendimiento de principios éticos y legales' }
        ]},
        'III': { title: 'Destrezas y Habilidades', items: [
            { code: 'destreza_a', label: 'Destreza para explicar ideas y procedimientos' },
            { code: 'destreza_b', label: 'Realizar preguntas pertinentes' },
            { code: 'destreza_c', label: 'Hacer comentarios útiles y de enseñanza' },
            { code: 'destreza_d', label: 'Diseñar buena investigación científica' },
            { code: 'destreza_e', label: 'Organización y administración del tiempo' }
        ]},
        'IV': { title: 'Capacidades', items: [
            { code: 'capacidad_a', label: 'Pensamiento crítico y lógico' },
            { code: 'capacidad_b', label: 'Manejo del estrés' },
            { code: 'capacidad_c', label: 'Sensibilidad y empatía' },
            { code: 'capacidad_d', label: 'Resolución de problemas' },
            { code: 'capacidad_e', label: 'Manejo de expediente clínico' }
        ]},
        'V': { title: 'Actitudes', items: [
            { code: 'actitud_a', label: 'Actitud positiva y trabajo en equipo' },
            { code: 'actitud_b', label: 'Proactividad y búsqueda de soluciones' },
            { code: 'actitud_c', label: 'Escucha y respeto a decisiones del equipo' },
            { code: 'actitud_d', label: 'Respeto a órdenes jerárquicas' },
            { code: 'actitud_e', label: 'Escucha y respeto a decisiones del equipo' },
            { code: 'actitud_f', label: 'Mejora ante observaciones y correcciones' }
        ]}
    };
    
    for (const [sectionNum, section] of Object.entries(sections)) {
        if (y > 250) {
            doc.addPage();
            y = margin;
        }
        
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${sectionNum}. ${section.title}`, margin + 2, y + 1);
        y += 10;
        
        // Table headers
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 4, pageWidth - 2 * margin, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Ítem', margin + 2, y + 1);
        doc.text('Descripción', margin + 25, y + 1);
        doc.text('Cal.', pageWidth - margin - 10, y + 1);
        y += 6;
        
        // Items
        doc.setFont('helvetica', 'normal');
        section.items.forEach((item, idx) => {
            const score = evaluacion.scores[item.code] || 0;
            doc.text(String.fromCharCode(65 + idx), margin + 5, y);
            
            // Wrap text if too long
            const splitText = doc.splitTextToSize(item.label, 140);
            doc.text(splitText, margin + 25, y);
            
            doc.text(score.toString(), pageWidth - margin - 8, y);
            y += 5 * splitText.length;
        });
        
        y += 4;
    }
    
    // Observations
    if (y > 220) {
        doc.addPage();
        y = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('OBSERVACIONES', margin, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, pageWidth - 2 * margin, 25);
    const obsText = evaluacion.observaciones || 'Sin observaciones';
    const splitObs = doc.splitTextToSize(obsText, pageWidth - 2 * margin - 4);
    doc.text(splitObs, margin + 2, y + 5);
    y += 30;
    
    // Signatures
    if (y > 200) {
        doc.addPage();
        y = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('FIRMAS', margin, y);
    y += 8;
    
    // Profesor signature
    if (evaluacion.firmaProfesor) {
        try {
            doc.addImage(evaluacion.firmaProfesor, 'PNG', margin, y, 80, 30);
        } catch (e) {
            console.log('Error adding profesor signature');
        }
    }
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y + 30, margin + 80, y + 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Firma del Profesor', margin, y + 35);
    doc.text(evaluacion.profesorNombre, margin, y + 40);
    
    // Estudiante signature
    if (evaluacion.firmaEstudiante) {
        try {
            doc.addImage(evaluacion.firmaEstudiante, 'PNG', pageWidth - margin - 80, y, 80, 30);
        } catch (e) {
            console.log('Error adding estudiante signature');
        }
    }
    doc.line(pageWidth - margin - 80, y + 30, pageWidth - margin, y + 30);
    doc.text('Firma del Estudiante', pageWidth - margin - 80, y + 35);
    doc.text(`${evaluacion.estudianteNombre} ${evaluacion.estudianteApellido}`, pageWidth - margin - 80, y + 40);
    
    y += 50;
    
    // Summary
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Puntuación Total: ${evaluacion.totalScore}/96`, margin + 10, y + 10);
    doc.text(`Promedio: ${evaluacion.promedio.toFixed(1)}/4.0`, margin + 80, y + 10);
    doc.text(`Resultado: ${getResultadoText(evaluacion.promedio)}`, pageWidth - margin - 60, y + 10);
    
    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Hospital Dr. Salvador B. Gautier - Servicio Nacional de Salud', pageWidth / 2, 280, { align: 'center' });
    
    // Save
    const filename = `Evaluacion_${evaluacion.estudianteApellido}_${evaluacion.estudianteNombre}_T${evaluacion.trimestre}_R${evaluacion.anio}.pdf`;
    
    if (print) {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    } else {
        doc.save(filename);
        showToast('PDF generado exitosamente', 'success');
    }
}

function deleteEvaluation(id) {
    if (confirm('¿Está seguro que desea eliminar esta evaluación? Esta acción no se puede deshacer.')) {
        AppState.evaluaciones = AppState.evaluaciones.filter(e => e.id !== id);
        saveData();
        updateDashboard();
        showToast('Evaluación eliminada', 'info');
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
        closeModal(e.target.id);
    }
});