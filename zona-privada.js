/* Zona Privada — autenticación y agenda de LA TUNA */
(function () {
    'use strict';

    const SUPABASE_URL = 'https://huxtznmeyprkalgivzfg.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_9BU9wWiKAYvdWEXL5FKOkQ_5YPIFNsq';
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));

    const views = { auth: $('#authView'), member: $('#memberView'), admin: $('#adminView') };
    let currentUser = null;
    let currentProfile = null;
    let calendar = null;
    let adminCalendar = null;
    let events = [];

    function setMessage(element, text, type) {
        element.textContent = text || '';
        element.className = 'private-message' + (type ? ' ' + type : '');
    }

    function errorText(error) {
        const message = (error && error.message) || '';
        if (/Invalid login credentials/i.test(message)) return 'El correo o la contraseña no son correctos.';
        if (/already registered|already been registered/i.test(message)) return 'Ese correo ya está registrado. Intenta iniciar sesión.';
        if (/rate limit/i.test(message)) return 'Se ha alcanzado temporalmente el límite de intentos. Espera unos minutos.';
        return message || 'No se ha podido completar la operación. Inténtalo de nuevo.';
    }

    function showView(view) {
        Object.values(views).forEach((element) => { if (element) element.hidden = element !== view; });
        $('#logoutBtn').hidden = view === views.auth;
    }

    function setAuthTab(tab) {
        $$('.private-tab').forEach((button) => button.classList.toggle('active', button.dataset.authTab === tab));
        $('#loginForm').hidden = tab !== 'login';
        $('#registerForm').hidden = tab !== 'register';
        setMessage($('#authMessage'), '');
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date + 'T12:00:00'));
    }

    function formatTime(value) { return value ? value.slice(0, 5) : '—'; }

    function eventColor(category, status) {
        if (status === 'cancelado') return '#666666';
        return { actuacion: '#990000', ensayo: '#7b5b18', reunion: '#5b3b78', viaje: '#19606b', evento_privado: '#8a3d58', otros: '#465b73' }[category] || '#465b73';
    }

    function eventLabel(category) { return { actuacion: 'Actuación', ensayo: 'Ensayo', reunion: 'Reunión', viaje: 'Viaje', evento_privado: 'Evento privado', otros: 'Otros' }[category] || 'Otros'; }

    async function loadSession() {
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        currentUser = data.session ? data.session.user : null;
        if (!currentUser) { showView(views.auth); return; }
        const result = await client.from('perfiles').select('*').eq('id', currentUser.id).single();
        if (result.error) throw result.error;
        currentProfile = result.data;
        if (currentProfile.estado !== 'aprobado') {
            showView(views.auth);
            setMessage($('#authMessage'), currentProfile.estado === 'pendiente' ? 'Tu solicitud está pendiente de aprobación por el administrador.' : 'Tu cuenta no tiene acceso activo a la Zona Privada.', 'error');
            return;
        }
        $('#welcomeTitle').textContent = `Bienvenido, ${currentProfile.nombre}`;
        $('#memberStatus').textContent = currentProfile.apodo ? `Hola, ${currentProfile.apodo}. Aquí tienes la agenda interna.` : 'Aquí tienes la agenda interna de la tuna.';
        $('#roleLabel').textContent = currentProfile.rol === 'admin' ? 'Administrador' : 'Miembro';
        showView(views.member);
        await loadEvents();
        if (currentProfile.rol === 'admin') { showView(views.admin); await loadAdminData(); }
    }

    async function loadEvents() {
        const { data, error } = await client.from('eventos').select('*').eq('visible', true).order('fecha', { ascending: true }).order('hora_inicio', { ascending: true });
        if (error) { setMessage($('#memberMessage'), errorText(error), 'error'); return; }
        events = data || [];
        renderCalendar(events, 'calendar');
        const today = new Date().toISOString().slice(0, 10);
        const future = events.filter((event) => event.fecha >= today && event.estado !== 'cancelado');
        $('#eventCount').textContent = future.length;
        const next = future[0];
        $('#nextEventTitle').textContent = next ? next.titulo : 'Sin eventos publicados';
        $('#nextEventMeta').textContent = next ? `${formatDate(next.fecha)} · ${formatTime(next.hora_inicio)}` : '—';
    }

    function renderCalendar(items, targetId) {
        const calendarEvents = items.map((event) => ({
            id: event.id, title: event.titulo, start: `${event.fecha}T${event.hora_inicio}`, end: event.hora_fin ? `${event.fecha}T${event.hora_fin}` : undefined,
            backgroundColor: eventColor(event.categoria, event.estado), borderColor: eventColor(event.categoria, event.estado), extendedProps: event
        }));
        const target = $('#' + targetId);
        if (!target) return;
        if (targetId === 'adminCalendar' && adminCalendar) adminCalendar.destroy();
        if (targetId === 'calendar' && calendar) calendar.destroy();
        const instance = new FullCalendar.Calendar(target, {
            locale: 'es', firstDay: 1, height: 'auto', initialView: window.innerWidth < 600 ? 'listMonth' : 'dayGridMonth',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listMonth' }, buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', list: 'Agenda' },
            noEventsText: 'No hay eventos publicados', events: calendarEvents,
            eventClick: (info) => openEventModal(info.event.extendedProps),
            eventDidMount: (info) => { if (info.event.extendedProps.estado === 'cancelado') info.el.style.textDecoration = 'line-through'; }
        });
        instance.render();
        if (targetId === 'adminCalendar') adminCalendar = instance;
        else calendar = instance;
    }

    function openEventModal(event) {
        $('#eventModalCategory').textContent = `${eventLabel(event.categoria)} · ${event.estado}`;
        $('#eventModalTitle').textContent = event.titulo;
        $('#eventModalDate').textContent = formatDate(event.fecha);
        $('#eventModalTime').textContent = `${formatTime(event.hora_inicio)}${event.hora_fin ? ' – ' + formatTime(event.hora_fin) : ''}`;
        $('#eventModalPlace').textContent = event.lugar;
        $('#eventModalStatus').textContent = event.estado;
        $('#eventModalDescription').textContent = event.descripcion || 'Sin observaciones adicionales.';
        $('#eventModal').hidden = false;
    }

    async function register(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const password = form.get('password');
        if (password !== form.get('password2')) { setMessage($('#authMessage'), 'Las contraseñas no coinciden.', 'error'); return; }
        const { error } = await client.auth.signUp({ email: form.get('email'), password, options: { data: {
            nombre: form.get('nombre'), apellidos: form.get('apellidos'), apodo: form.get('apodo'), instrumento: form.get('instrumento'), promocion: form.get('promocion'), telefono: form.get('telefono')
        } } });
        if (error) { setMessage($('#authMessage'), errorText(error), 'error'); return; }
        event.currentTarget.reset();
        setMessage($('#authMessage'), 'Solicitud enviada. Revisa tu correo si Supabase solicita confirmación y espera la aprobación del administrador.', 'success');
    }

    async function login(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const { error } = await client.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
        if (error) { setMessage($('#authMessage'), errorText(error), 'error'); return; }
        await loadSession();
    }

    async function forgotPassword() {
        const email = $('#loginEmail').value.trim();
        if (!email) { setMessage($('#authMessage'), 'Escribe primero tu correo electrónico.', 'error'); return; }
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/zona-privada.html` });
        setMessage($('#authMessage'), error ? errorText(error) : 'Te hemos enviado un enlace para restablecer la contraseña.', error ? 'error' : 'success');
    }

    async function logout() { await client.auth.signOut(); currentUser = null; currentProfile = null; showView(views.auth); setMessage($('#authMessage'), 'Sesión cerrada correctamente.', 'success'); }

    async function loadAdminData() {
        const [membersResult, eventsResult] = await Promise.all([
            client.from('perfiles').select('*').order('estado').order('nombre'),
            client.from('eventos').select('*').order('fecha', { ascending: true }).order('hora_inicio', { ascending: true })
        ]);
        if (membersResult.error || eventsResult.error) { setMessage($('#adminMessage'), errorText(membersResult.error || eventsResult.error), 'error'); return; }
        renderMembers(membersResult.data || []); renderAdminEvents(eventsResult.data || []);
        renderCalendar(eventsResult.data || [], 'adminCalendar');
    }

    function renderMembers(members) {
        const list = $('#membersList'); list.innerHTML = '';
        if (!members.length) { list.innerHTML = '<p class="private-muted">No hay miembros registrados.</p>'; return; }
        members.forEach((member) => {
            const row = document.createElement('div'); row.className = 'private-list-item';
            const label = document.createElement('div'); label.innerHTML = `<strong>${escapeHtml(member.nombre)} ${escapeHtml(member.apellidos)}</strong><small>${escapeHtml(member.email)} · ${member.estado}</small>`;
            const actions = document.createElement('div'); actions.className = 'private-list-actions';
            if (member.id !== currentUser.id && member.estado !== 'aprobado') actions.appendChild(actionButton('Aprobar', () => changeMember(member.id, { estado: 'aprobado' })));
            if (member.id !== currentUser.id && member.estado === 'aprobado') actions.appendChild(actionButton('Desactivar', () => changeMember(member.id, { estado: 'desactivado' })));
            if (member.id !== currentUser.id && member.estado !== 'rechazado') actions.appendChild(actionButton('Rechazar', () => changeMember(member.id, { estado: 'rechazado' })));
            row.append(label, actions); list.appendChild(row);
        });
    }

    function renderAdminEvents(items) {
        const list = $('#adminEventsList'); list.innerHTML = '';
        if (!items.length) { list.innerHTML = '<p class="private-muted">No hay eventos creados.</p>'; return; }
        items.forEach((event) => {
            const row = document.createElement('div'); row.className = 'private-list-item';
            const visibility = event.visible ? 'visible' : 'oculto';
            const label = document.createElement('div'); label.innerHTML = `<strong>${escapeHtml(event.titulo)}</strong><small>${formatDate(event.fecha)} · ${eventLabel(event.categoria)} · ${visibility}</small>`;
            const actions = document.createElement('div'); actions.className = 'private-list-actions';
            actions.append(actionButton('Editar', () => editEvent(event)), actionButton(event.visible ? 'Ocultar' : 'Mostrar', () => updateEvent(event.id, { visible: !event.visible })), actionButton('Borrar', () => deleteEvent(event.id)));
            row.append(label, actions); list.appendChild(row);
        });
    }

    function actionButton(text, handler) { const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.addEventListener('click', handler); return button; }
    function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

    async function changeMember(id, patch) { const { error } = await client.from('perfiles').update(patch).eq('id', id); if (error) setMessage($('#adminMessage'), errorText(error), 'error'); else { setMessage($('#adminMessage'), 'Estado del miembro actualizado.', 'success'); await loadAdminData(); } }
    async function updateEvent(id, patch) { const { error } = await client.from('eventos').update(patch).eq('id', id); if (error) setMessage($('#adminMessage'), errorText(error), 'error'); else { setMessage($('#adminMessage'), 'Evento actualizado.', 'success'); await loadAdminData(); await loadEvents(); } }
    async function deleteEvent(id) { if (!window.confirm('¿Eliminar definitivamente este evento?')) return; const { error } = await client.from('eventos').delete().eq('id', id); if (error) setMessage($('#adminMessage'), errorText(error), 'error'); else { setMessage($('#adminMessage'), 'Evento eliminado.', 'success'); await loadAdminData(); await loadEvents(); } }

    function editEvent(event) {
        $('#eventEditor').hidden = false; $('#eventEditorTitle').textContent = 'Editar evento';
        $('#eventId').value = event.id; $('#eventTitle').value = event.titulo; $('#eventCategory').value = event.categoria; $('#eventDate').value = event.fecha; $('#eventStart').value = formatTime(event.hora_inicio); $('#eventEnd').value = formatTime(event.hora_fin); $('#eventPlace').value = event.lugar; $('#eventDescription').value = event.descripcion || ''; $('#eventStatus').value = event.estado; $('#eventVisible').checked = event.visible; $('#eventFeatured').checked = event.destacado; window.scrollTo({ top: $('#eventEditor').offsetTop - 90, behavior: 'smooth' });
    }

    function resetEventEditor() { $('#eventEditor').hidden = true; $('#eventForm').reset(); $('#eventId').value = ''; $('#eventEditorTitle').textContent = 'Nuevo evento'; }

    async function saveEvent(event) {
        event.preventDefault();
        const payload = { titulo: $('#eventTitle').value.trim(), fecha: $('#eventDate').value, hora_inicio: $('#eventStart').value, hora_fin: $('#eventEnd').value || null, lugar: $('#eventPlace').value.trim(), categoria: $('#eventCategory').value, descripcion: $('#eventDescription').value.trim() || null, estado: $('#eventStatus').value, visible: $('#eventVisible').checked, destacado: $('#eventFeatured').checked };
        if (payload.hora_fin && payload.hora_fin <= payload.hora_inicio) { setMessage($('#adminMessage'), 'La hora de fin debe ser posterior a la hora de inicio.', 'error'); return; }
        const id = $('#eventId').value; const result = id ? await client.from('eventos').update(payload).eq('id', id) : await client.from('eventos').insert({ ...payload, creado_por: currentUser.id });
        if (result.error) { setMessage($('#adminMessage'), errorText(result.error), 'error'); return; }
        setMessage($('#adminMessage'), id ? 'Evento modificado correctamente.' : 'Evento creado correctamente.', 'success'); resetEventEditor(); await loadAdminData(); await loadEvents();
    }

    function setup() {
        const hamburger = $('#hamburger');
        const mainNav = $('#mainNav');
        if (hamburger && mainNav) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                mainNav.classList.toggle('active');
                document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
            });
            mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }));
        }
        $$('.private-tab').forEach((button) => button.addEventListener('click', () => setAuthTab(button.dataset.authTab)));
        $('#loginForm').addEventListener('submit', login); $('#registerForm').addEventListener('submit', register); $('#forgotPasswordBtn').addEventListener('click', forgotPassword); $('#logoutBtn').addEventListener('click', logout);
        $('#refreshEventsBtn').addEventListener('click', loadEvents); $('[data-close-modal]').addEventListener('click', () => { $('#eventModal').hidden = true; }); $('#newEventBtn').addEventListener('click', () => { resetEventEditor(); $('#eventEditor').hidden = false; $('#eventEditor').scrollIntoView({ behavior: 'smooth', block: 'start' }); }); $('#cancelEventBtn').addEventListener('click', resetEventEditor); $('#eventForm').addEventListener('submit', saveEvent);
        client.auth.onAuthStateChange((_event, session) => { currentUser = session ? session.user : null; if (!currentUser) showView(views.auth); });
        loadSession().catch((error) => { showView(views.auth); setMessage($('#authMessage'), errorText(error), 'error'); });
    }
    setup();
})();
