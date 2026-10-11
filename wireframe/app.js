const fixture = {
  workspaces: [
    { id: 'growth-lab', name: "Mayur's Studio", initials: 'M', type: 'Personal workspace', summary: '24 videos · Growth plan', avatarClass: 'avatar-blue' },
    { id: 'client-lab', name: 'Client Review Studio', initials: 'C', type: 'Client workspace', summary: '8 videos · Shared with team', avatarClass: 'avatar-yellow' },
    { id: 'india-launch', name: 'India Launch Studio', initials: 'I', type: 'Video workspace', summary: '12 videos · India-first', avatarClass: 'avatar-lilac' }
  ],
  videos: [
    { id: 'crompton-dlx', title: 'A cooler room in one tap', description: 'A familiar Hindi voice introduces the Classic DLX in a warm home setting.', mode: 'ai_actor', status: 'review', statusLabel: 'Needs review', language: 'Hindi', duration: '8–10 sec', placement: 'Present the product', date: '5 Oct 2026', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85', product: 'Crompton Classic DLX', actor: 'Aisha Mehta', actorInitials: 'AM', outputs: 3 },
    { id: 'tea-demo', title: 'A better morning starts here', description: 'A warm Indian English voice makes the first cup feel like a small ritual.', mode: 'likeness', status: 'ready', statusLabel: 'Ready', language: 'Indian English', duration: '8–10 sec', placement: 'Use the product', date: '4 Oct 2026', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85', product: 'Morning Brew Tea', actor: 'Your likeness', actorInitials: 'YL', outputs: 4 },
    { id: 'airpure-first-draft', title: 'Make the air feel lighter', description: 'A draft with a product close-up and a simple problem-to-solution direction.', mode: 'ai_actor', status: 'draft', statusLabel: 'Draft', language: 'Hindi', duration: '20 sec', placement: 'Product close-up', date: '3 Oct 2026', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85', product: 'AirPure Mini', actor: 'Not selected', actorInitials: '—', outputs: 0 },
    { id: 'everyday-glow', title: 'The five-minute glow', description: 'A product-led skin routine waiting for its final voice and export review.', mode: 'ai_actor', status: 'generating', statusLabel: 'Generating', language: 'Hinglish', duration: '8–10 sec', placement: 'Use the product', date: '2 Oct 2026', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85', product: 'Everyday Glow', actor: 'Meera Shah', actorInitials: 'MS', outputs: 1 }
  ],
  products: [
    { id: 'crompton', name: 'Crompton Classic DLX', category: 'Home & living', price: '₹3,499', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=85', description: 'Powerful air delivery with a premium metallic finish.' },
    { id: 'tea', name: 'Morning Brew Tea', category: 'Food & beverage', price: '₹499', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=85', description: 'A bright everyday tea ritual with a warm finish.' },
    { id: 'glow', name: 'Everyday Glow', category: 'Beauty & wellness', price: '₹899', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=85', description: 'A gentle daily skincare routine for busy mornings.' }
  ],
  actors: [
    { id: 'aisha', name: 'Aisha Mehta', city: 'Mumbai, India', fit: '4.9', tags: ['Hindi', 'Relatable'], image: 'assets/creator-aisha.png' },
    { id: 'rohan', name: 'Rohan Kapoor', city: 'Delhi, India', fit: '4.8', tags: ['Hinglish', 'Energetic'], image: 'assets/creator-rohan.png' },
    { id: 'meera', name: 'Meera Shah', city: 'Pune, India', fit: '4.9', tags: ['Marathi', 'Premium'], image: 'assets/creator-meera.png' },
    { id: 'vikram', name: 'Vikram Rao', city: 'Bengaluru, India', fit: '4.7', tags: ['Kannada', 'Conversational'], image: 'assets/creator-vikram.png' },
    { id: 'tara', name: 'Tara Singh', city: 'Chandigarh, India', fit: '4.8', tags: ['Punjabi', 'Warm'], image: 'assets/creator-tara.png' },
    { id: 'arjun', name: 'Arjun Nair', city: 'Kochi, India', fit: '4.7', tags: ['Malayalam', 'Premium'], image: 'assets/creator-arjun.png' }
  ],
  placements: [
    { id: 'present', title: 'Present the product', description: 'The person holds or presents the product naturally to camera.', icon: '▣' },
    { id: 'use', title: 'Use the product', description: 'The person demonstrates the product in a believable everyday moment.', icon: '◉' },
    { id: 'insert', title: 'Product close-up', description: 'A product-focused insert gives the packaging and details the spotlight.', icon: '◇' }
  ],
  languages: ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Indian English']
};

const state = {
  view: 'dashboard',
  workspaceId: 'growth-lab',
  mode: 'likeness',
  videoFilter: 'all',
  videoSearch: '',
  selectedVideoId: 'tea-demo',
  actorSearch: '',
  actorLanguage: 'all',
  generationStatus: 'idle',
  generationProgress: 0,
  flow: {
    mode: 'likeness',
    step: 1,
    productId: 'tea',
    actorId: 'aisha',
    placement: 'present',
    placementNotes: '',
    duration: '8–10 sec',
    audioMode: 'reference',
    language: 'Hindi',
    voice: 'Reference voice',
    tone: 'Natural and conversational',
    background: 'Bright home interior',
    script: 'Show how this small daily ritual makes the morning feel easier.',
    brief: 'Create a warm product-led video that feels like a real recommendation from a trusted friend.',
    portraitName: '',
    referenceVideoName: '',
    consentConfirmed: false,
    captions: true,
    music: false,
    disclosure: true
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));

function imageFallback(image) {
  image.addEventListener('error', () => {
    image.classList.add('image-fallback');
    image.removeAttribute('src');
    image.setAttribute('aria-label', image.alt || 'Image placeholder');
  }, { once: true });
}

function statusClass(status) { return `status-${status}`; }
function selectedProduct() { return fixture.products.find((product) => product.id === state.flow.productId) || fixture.products[0]; }
function selectedActor() { return fixture.actors.find((actor) => actor.id === state.flow.actorId) || fixture.actors[0]; }
function selectedPlacement() { return fixture.placements.find((placement) => placement.id === state.flow.placement) || fixture.placements[0]; }

function filteredVideos() {
  const search = state.videoSearch.trim().toLowerCase();
  return fixture.videos.filter((video) => {
    const matchesStatus = state.videoFilter === 'all' || video.status === state.videoFilter;
    const haystack = `${video.title} ${video.product} ${video.language} ${video.actor}`.toLowerCase();
    return matchesStatus && (!search || haystack.includes(search));
  });
}

function videoRow(video) {
  return `<article class="video-row" data-video-id="${video.id}"><div class="video-thumb"><img src="${video.image}" alt="${escapeHtml(video.product)} preview" /><span class="thumb-play">▶</span></div><div class="video-main"><strong>${escapeHtml(video.title)}</strong><span>${escapeHtml(video.product)} · ${escapeHtml(video.mode === 'likeness' ? 'Your likeness' : 'AI actor')}</span></div><div class="video-meta"><strong>${escapeHtml(video.language)}</strong><span>${escapeHtml(video.duration)}</span></div><div><span class="badge ${statusClass(video.status)}">${escapeHtml(video.statusLabel)}</span></div><button class="icon-button" type="button" data-route="video-detail" aria-label="Open ${escapeHtml(video.title)}">↗</button></article>`;
}

function videoCard(video) {
  return `<article class="video-card" data-video-id="${video.id}"><button class="video-card-cover" type="button" data-route="video-detail" aria-label="Open ${escapeHtml(video.title)}"><img src="${video.image}" alt="${escapeHtml(video.product)} preview" /><span class="ai-label">AI VIDEO</span><span class="badge ${statusClass(video.status)}">${escapeHtml(video.statusLabel)}</span><span class="preview-play">▶</span></button><div class="video-card-body"><div class="video-card-title"><h3>${escapeHtml(video.title)}</h3><button class="icon-button" type="button" aria-label="More actions for ${escapeHtml(video.title)}" data-toast="Video actions are available in the detail view.">•••</button></div><p>${escapeHtml(video.description)}</p><div class="card-facts"><span class="card-fact">${escapeHtml(video.mode === 'likeness' ? 'Your likeness' : 'AI actor')}</span><span class="card-fact">${escapeHtml(video.language)}</span><span class="card-fact">${video.outputs ? `${video.outputs} outputs` : 'Draft'}</span></div><div class="card-footer"><span>${escapeHtml(video.date)} · ${escapeHtml(video.duration)}</span><span class="mini-avatar">${escapeHtml(video.actorInitials)}</span></div></div></article>`;
}

function renderVideos() {
  const videos = filteredVideos();
  const dashboardList = $('#dashboard-video-list');
  const allGrid = $('#all-videos-grid');
  if (dashboardList) dashboardList.innerHTML = videos.length ? videos.slice(0, 4).map(videoRow).join('') : `<div class="empty-state"><span>⌕</span><strong>No videos found</strong><p>Try a different search or status filter.</p></div>`;
  if (allGrid) allGrid.innerHTML = videos.length ? videos.map(videoCard).join('') : `<div class="empty-state"><span>⌕</span><strong>No videos found</strong><p>Try a different search or status filter.</p></div>`;
  $$('img').forEach((image) => { if (image.src) imageFallback(image); });
}

function renderWorkspaceMenu() {
  const menu = $('#workspace-menu');
  if (!menu) return;
  menu.innerHTML = fixture.workspaces.map((workspace) => `<button class="workspace-option" type="button" role="option" aria-selected="${workspace.id === state.workspaceId}" data-workspace-option="${workspace.id}"><span class="avatar ${workspace.avatarClass}">${workspace.initials}</span><span class="workspace-option-copy"><strong>${escapeHtml(workspace.name)}</strong><small>${escapeHtml(workspace.type)} · ${escapeHtml(workspace.summary)}</small></span>${workspace.id === state.workspaceId ? '<span class="workspace-check">✓</span>' : ''}</button>`).join('') + '<div class="workspace-menu-divider"></div><button class="workspace-create" type="button" data-toast="Workspace creation is simulated in this wireframe."><span>＋</span><span><strong>Create workspace</strong><small>Keep another studio separate</small></span></button>';
}

function updateWorkspaceUI() {
  const workspace = fixture.workspaces.find((item) => item.id === state.workspaceId) || fixture.workspaces[0];
  const name = $('[data-workspace-name]');
  const avatar = $('[data-workspace-avatar]');
  if (name) name.textContent = workspace.name;
  if (avatar) { avatar.textContent = workspace.initials; avatar.className = `avatar ${workspace.avatarClass}`; }
  renderWorkspaceMenu();
}

function toggleWorkspaceMenu() {
  const menu = $('#workspace-menu');
  const trigger = $('[data-workspace-trigger]');
  if (!menu || !trigger) return;
  const isOpen = !menu.hidden;
  menu.hidden = isOpen;
  trigger.setAttribute('aria-expanded', String(!isOpen));
  if (!isOpen) menu.querySelector('[aria-selected="true"]')?.focus();
}

function closeWorkspaceMenu() {
  const menu = $('#workspace-menu');
  const trigger = $('[data-workspace-trigger]');
  if (menu) menu.hidden = true;
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function modeLabel(mode) { return mode === 'likeness' ? 'Your likeness' : 'AI actor'; }
function modeEstimate(mode) { return mode === 'likeness' ? 'About 4 minutes' : 'About 2 minutes'; }

function setMode(mode) {
  state.mode = mode;
  state.flow.mode = mode;
  state.flow.step = 1;
  state.generationStatus = 'idle';
  state.generationProgress = 0;
  if (mode === 'ai_actor') {
    state.flow.language = 'Hindi';
    state.flow.voice = `${selectedActor().name} · Hindi`;
  } else {
    state.flow.language = 'Hindi';
    state.flow.voice = 'Reference voice';
  }
  syncModeLauncher();
  if (state.view === 'new-video') renderWizard();
}

function syncModeLauncher() {
  $$('[data-mode-choice]').forEach((button) => {
    if (button.dataset.modeChoice) {
      const isActive = button.dataset.modeChoice === state.mode;
      button.classList.toggle('active', isActive);
      if (button.getAttribute('role') === 'tab') button.setAttribute('aria-selected', String(isActive));
    }
  });
  const estimate = $('#mode-estimate');
  if (estimate) estimate.textContent = `${modeEstimate(state.mode)} · 7 guided steps`;
  const startLabel = $('#mode-start-label');
  if (startLabel) startLabel.textContent = state.mode === 'likeness' ? 'Start with your likeness' : 'Start with an AI actor';
}

function flowSteps() {
  return state.mode === 'likeness'
    ? ['Your likeness', 'Product', 'Placement', 'Direction', 'Voice & length', 'Shot review', 'Generate']
    : ['AI actor', 'Product', 'Placement', 'Creative brief', 'Language & voice', 'Shot review', 'Generate'];
}

function stepRail() {
  return flowSteps().map((label, index) => {
    const step = index + 1;
    const stateClass = step === state.flow.step ? 'active' : step < state.flow.step ? 'complete' : '';
    return `<button class="wizard-step ${stateClass}" type="button" data-wizard-step="${step}"><span>${step < state.flow.step ? '✓' : step}</span><strong>${label}</strong></button>`;
  }).join('');
}

function uploadCard(kind, title, subtitle, value) {
  return `<button class="upload-card ${value ? 'uploaded' : ''}" type="button" data-upload="${kind}"><span class="upload-icon">${value ? '✓' : '＋'}</span><span><strong>${value || title}</strong><small>${value ? 'Fixture asset selected · click to replace' : subtitle}</small></span><span class="upload-arrow">${value ? '↗' : '＋'}</span></button>`;
}

function placementCards(compact = false) {
  return fixture.placements.map((placement) => `<button class="placement-card ${state.flow.placement === placement.id ? 'selected' : ''} ${compact ? 'compact' : ''}" type="button" data-placement="${placement.id}"><span class="placement-visual placement-${placement.id}"><span>${placement.icon}</span></span><span class="placement-copy"><strong>${placement.title}</strong><small>${placement.description}</small></span>${state.flow.placement === placement.id ? '<span class="selected-check">✓</span>' : ''}</button>`).join('');
}

function productCards() {
  return fixture.products.map((product) => `<button class="product-choice ${state.flow.productId === product.id ? 'selected' : ''}" type="button" data-product-id="${product.id}"><span class="product-choice-image"><img src="${product.image}" alt="${escapeHtml(product.name)}" /></span><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category)} · ${escapeHtml(product.price)}</small></span>${state.flow.productId === product.id ? '<span class="selected-check">✓</span>' : ''}</button>`).join('');
}

function directionFields() {
  if (state.mode === 'likeness') {
    return `<div class="field-grid"><label>Background<select data-flow-field="background"><option>Bright home interior</option><option>Soft studio backdrop</option><option>Kitchen counter</option><option>Outdoor balcony</option></select></label><label>Delivery style<select data-flow-field="tone"><option>Natural and conversational</option><option>Warm and reassuring</option><option>High-energy recommendation</option><option>Quiet and premium</option></select></label></div><label>What should the person say or do?<textarea rows="5" data-flow-field="script">${escapeHtml(state.flow.script)}</textarea></label>`;
  }
  return `<div class="field-grid"><label>Audience<select data-flow-field="tone"><option>Natural and conversational</option><option>Warm and reassuring</option><option>High-energy recommendation</option><option>Quiet and premium</option></select></label><label>Setting<select data-flow-field="background"><option>Bright home interior</option><option>Soft studio backdrop</option><option>Kitchen counter</option><option>Outdoor balcony</option></select></label></div><label>Creative brief<textarea rows="5" data-flow-field="brief">${escapeHtml(state.flow.brief)}</textarea></label><div class="mini-checks"><label><input type="checkbox" data-flow-toggle="captions" ${state.flow.captions ? 'checked' : ''} /> On-screen captions</label><label><input type="checkbox" data-flow-toggle="music" ${state.flow.music ? 'checked' : ''} /> Add light music</label><label><input type="checkbox" data-flow-toggle="disclosure" ${state.flow.disclosure ? 'checked' : ''} /> AI disclosure</label></div>`;
}

function durationCards() {
  return ['8–10 sec', '20 sec', '30 sec'].map((duration) => `<button class="duration-card ${state.flow.duration === duration ? 'selected' : ''}" type="button" data-duration="${duration}"><strong>${duration}</strong><small>${duration === '8–10 sec' ? 'Recommended for social' : duration === '20 sec' ? 'More room to explain' : 'Full product story'}</small></button>`).join('');
}

function stepContent() {
  const product = selectedProduct();
  const actor = selectedActor();
  const placement = selectedPlacement();
  switch (state.flow.step) {
    case 1:
      return state.mode === 'likeness'
        ? `<div class="step-heading"><span class="step-eyebrow">Step 1 · Your likeness</span><h2>Bring your real presence into the frame.</h2><p>Upload a clear portrait and a short reference clip so the video can follow your expressions, gestures, and voice.</p></div><div class="source-grid">${uploadCard('portrait', 'Upload a portrait', 'Front-facing image · JPG or PNG', state.flow.portraitName)}${uploadCard('reference', 'Add a reference video', '10–30 seconds · speak naturally', state.flow.referenceVideoName)}</div><div class="recording-guide"><span class="guide-icon">●</span><div><strong>Recording guide</strong><p>Face a window, keep your shoulders visible, and say a few natural sentences with the energy you want to recreate.</p></div><button class="text-button" type="button" data-toast="Recording guidance opened.">View guide ↗</button></div><label class="consent-card ${state.flow.consentConfirmed ? 'confirmed' : ''}"><input id="consent-confirmed" type="checkbox" data-flow-check="consentConfirmed" ${state.flow.consentConfirmed ? 'checked' : ''} /><span><strong>I have permission to use this person’s face and voice.</strong><small>This prototype keeps the source private and adds AI disclosure to the output.</small></span></label>`
        : `<div class="step-heading"><span class="step-eyebrow">Step 1 · AI actor</span><h2>Choose the presence for your video.</h2><p>Pick a synthetic Indian actor with a delivery style that fits your product and audience.</p></div><div class="selected-actor-card"><img src="${actor.image}" alt="${escapeHtml(actor.name)}" /><div><span class="badge badge-blue">Synthetic actor · India</span><h3>${escapeHtml(actor.name)}</h3><p>${escapeHtml(actor.city)} · ${escapeHtml(actor.tags.join(' · '))}</p><div class="actor-quality"><span>★ ${actor.fit}</span><span>Voice matched</span><span>Gestures ready</span></div></div><button class="button button-outline" type="button" data-dialog="actor-dialog">Change actor</button></div><div class="actor-note"><span>✦</span><div><strong>Actor and voice stay consistent</strong><p>Choose a different actor later and the rest of your product brief will stay intact.</p></div></div>`;
    case 2:
      return `<div class="step-heading"><span class="step-eyebrow">Step 2 · Product</span><h2>What should appear in the video?</h2><p>Choose a product from your shelf or add a new one. Product identity stays consistent across every output.</p></div><div class="product-choice-list">${productCards()}<button class="add-product-choice" type="button" data-dialog="product-dialog"><span>＋</span><strong>Add a new product</strong><small>Upload an image or paste a product URL</small></button></div><div class="selected-product-summary"><img src="${product.image}" alt="${escapeHtml(product.name)}" /><div><span class="eyebrow">Selected product</span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.description)}</small></div><span class="badge badge-green">Product source ready</span></div>`;
    case 3:
      return `<div class="step-heading"><span class="step-eyebrow">Step 3 · Product placement</span><h2>Choose the product moment.</h2><p>These three presets guide the shot. You can add a more specific placement note below.</p></div><div class="placement-grid">${placementCards()}</div><label>Placement notes <span class="optional">Optional</span><textarea rows="4" data-flow-field="placementNotes" placeholder="e.g. Keep the product label facing the camera.">${escapeHtml(state.flow.placementNotes)}</textarea></label>`;
    case 4:
      return `<div class="step-heading"><span class="step-eyebrow">Step 4 · ${state.mode === 'likeness' ? 'Video direction' : 'Creative brief'}</span><h2>${state.mode === 'likeness' ? 'Direct the performance.' : 'Give the actor a clear brief.'}</h2><p>${state.mode === 'likeness' ? 'Describe the action, tone, and setting. The reference clip supplies the person’s natural movement.' : 'Keep the direction specific enough to guide the actor, product placement, and final pacing.'}</p></div>${directionFields()}<div class="direction-chips"><span>AI disclosure on</span><span>9:16 vertical</span><span>Product facts protected</span></div>`;
    case 5:
      return `<div class="step-heading"><span class="step-eyebrow">Step 5 · ${state.mode === 'likeness' ? 'Voice and length' : 'Language and voice'}</span><h2>Set the pace and sound.</h2><p>${state.mode === 'likeness' ? 'The reference voice will guide the delivery and lip sync.' : 'Voice options are filtered by the selected actor and language.'}</p>${state.mode === 'ai_actor' ? `<div class="field-grid"><label>Language<select data-flow-field="language">${fixture.languages.map((language) => `<option ${language === state.flow.language ? 'selected' : ''}>${language}</option>`).join('')}</select></label><label>Actor voice<select data-flow-field="voice"><option>${escapeHtml(actor.name)} · ${escapeHtml(state.flow.language)}</option><option>${escapeHtml(actor.name)} · warm delivery</option><option>${escapeHtml(actor.name)} · energetic delivery</option></select></label></div>` : '<div class="voice-source"><span class="voice-avatar">YL</span><div><strong>Reference voice</strong><small>Matched from your reference clip</small></div><span class="badge badge-green">Lip sync ready</span></div>'}</div><div class="duration-grid">${durationCards()}</div><div class="voice-options"><label class="voice-option selected"><input type="radio" name="audio-mode" value="reference" data-audio-mode="reference" ${state.flow.audioMode === 'reference' ? 'checked' : ''} /><span><strong>${state.mode === 'likeness' ? 'Use reference voice' : 'Use actor voice'}</strong><small>Audio duration follows the selected video length.</small></span></label><label class="voice-option"><input type="radio" name="audio-mode" value="upload" data-audio-mode="upload" ${state.flow.audioMode === 'upload' ? 'checked' : ''} /><span><strong>Upload custom audio</strong><small>Replace the generated delivery with a clean audio track.</small></span></label></div><div class="waveform" aria-label="Audio waveform preview"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
    case 6:
      return `<div class="step-heading"><span class="step-eyebrow">Step 6 · Shot review</span><h2>Pick the shot to generate.</h2><p>Preview how the product moment will be framed before you spend a credit.</p></div><div class="placement-grid review-grid">${placementCards(true)}</div><div class="review-summary"><div><span class="eyebrow">Selected direction</span><strong>${escapeHtml(placement.title)}</strong><small>${escapeHtml(product.name)} · ${escapeHtml(state.flow.duration)} · ${escapeHtml(state.flow.language)}</small></div><button class="button button-outline" type="button" data-action="edit-placement">Edit placement</button></div><div class="review-checks"><span>✓ Product identity locked</span><span>✓ ${state.mode === 'likeness' ? 'Likeness consent confirmed' : 'Synthetic actor selected'}</span><span>✓ AI disclosure enabled</span></div>`;
    default:
      return generationStepContent();
  }
}

function generationStepContent() {
  const product = selectedProduct();
  const actor = selectedActor();
  const status = state.generationStatus;
  if (status === 'queued' || status === 'running') {
    return `<div class="generation-state centered"><div class="generation-orbit"><span></span><span></span><span></span></div><span class="step-eyebrow">${status === 'queued' ? 'Queued' : 'Generating'}</span><h2>${status === 'queued' ? 'Your video is in line.' : 'Building your video.'}</h2><p>${status === 'queued' ? 'The render service is preparing your assets.' : 'Matching voice, gesture, product placement, and lip sync.'}</p><div class="large-progress"><span style="width:${state.generationProgress}%"></span></div><strong>${state.generationProgress}% complete</strong><button class="text-button" type="button" data-action="simulate-failure">Show failure recovery</button></div>`;
  }
  if (status === 'failed') {
    return `<div class="generation-state centered failed-state"><span class="state-icon">!</span><span class="step-eyebrow">Provider needs attention</span><h2>The render could not finish.</h2><p>The preview service timed out while matching the product insert. Your inputs are safe and ready to retry.</p><div class="error-box"><strong>What you can do next</strong><span>Retry the same request or change the selected placement.</span></div><div class="inline-actions"><button class="button button-dark" type="button" data-action="retry-generation">Retry generation</button><button class="button button-outline" type="button" data-action="edit-placement">Change placement</button></div></div>`;
  }
  if (status === 'needs_review') {
    return `<div class="generation-state"><div class="result-banner"><span class="state-icon success">✓</span><div><strong>Video ready for review</strong><small>AI disclosure and provenance metadata are attached.</small></div><span class="badge status-review">Needs review</span></div><div class="output-review"><div class="output-frame"><div class="output-sheen"></div><span class="ai-label">AI VIDEO · 9:16</span><span class="preview-play">▶</span><span class="output-product">${escapeHtml(product.name)}</span></div><div class="output-copy"><span class="eyebrow">${escapeHtml(state.flow.duration)} · ${escapeHtml(state.flow.language)}</span><h3>${escapeHtml(state.flow.placement === 'insert' ? 'Product close-up' : 'Product moment')} is ready.</h3><p>${escapeHtml(state.mode === 'likeness' ? 'Your likeness and reference voice are matched in this preview.' : `${actor.name} is ready with the selected voice and direction.`)}</p><div class="review-checks"><span>✓ Lip sync checked</span><span>✓ Product facts protected</span><span>✓ AI disclosure added</span></div></div></div><div class="review-action-bar"><button class="button button-dark" type="button" data-action="approve-generation">Approve and mark ready</button><button class="button button-outline" type="button" data-dialog="share-dialog">Share review</button></div></div>`;
  }
  if (status === 'completed') {
    return `<div class="generation-state"><div class="result-banner"><span class="state-icon success">✓</span><div><strong>Video marked ready</strong><small>Final output and provenance metadata are available.</small></div><span class="badge status-ready">Ready</span></div><div class="output-review"><div class="output-frame completed"><div class="output-sheen"></div><span class="ai-label">AI VIDEO · 9:16</span><span class="preview-play">▶</span><span class="output-product">${escapeHtml(product.name)}</span></div><div class="output-copy"><span class="eyebrow">Final output · ${escapeHtml(state.flow.duration)}</span><h3>Ready to share with your team.</h3><p>Download the video, duplicate it for another variation, or send a read-only review link.</p><div class="review-checks"><span>✓ Ready for export</span><span>✓ Provenance attached</span><span>✓ AI disclosure added</span></div></div></div><div class="review-action-bar"><button class="button button-dark" type="button" data-dialog="export-dialog">Export video</button><button class="button button-outline" type="button" data-dialog="share-dialog">Share review</button><button class="button button-ghost" type="button" data-action="duplicate-video">Duplicate</button></div></div>`;
  }
  return `<div class="generation-state"><div class="ready-to-generate"><span class="state-icon">✦</span><div><span class="step-eyebrow">Ready to generate</span><h2>Your inputs are ready.</h2><p>Generate one ${escapeHtml(state.flow.duration)} video with ${escapeHtml(state.mode === 'likeness' ? 'your likeness' : `${actor.name}, a synthetic Indian actor`)}.</p></div><strong>1 credit</strong></div><div class="generation-summary"><div><span>Product</span><strong>${escapeHtml(product.name)}</strong></div><div><span>Placement</span><strong>${escapeHtml(selectedPlacement().title)}</strong></div><div><span>Audio</span><strong>${escapeHtml(state.flow.voice)}</strong></div><div><span>Disclosure</span><strong>Enabled</strong></div></div><div class="notice notice-blue"><span>i</span><p>Generation is asynchronous. You can leave this page and return to the video when it is ready.</p></div></div>`;
}

function renderPreview() {
  const product = selectedProduct();
  const actor = selectedActor();
  const previewImage = state.mode === 'ai_actor' ? actor.image : 'assets/creator-aisha.png';
  const progress = state.generationProgress;
  const statusText = state.generationStatus === 'running' ? `Generating · ${progress}%` : state.generationStatus === 'queued' ? 'Queued' : state.generationStatus === 'failed' ? 'Retry available' : state.generationStatus === 'completed' ? 'Ready to export' : state.generationStatus === 'needs_review' ? 'Needs review' : 'Preview';
  return `<div class="preview-header"><div><p class="section-kicker">Live preview</p><h2>${escapeHtml(state.mode === 'likeness' ? 'Your likeness' : actor.name)}</h2></div><span class="badge ${statusClass(state.generationStatus === 'completed' ? 'ready' : state.generationStatus === 'needs_review' ? 'review' : state.generationStatus === 'failed' ? 'failed' : 'draft')}">${statusText}</span></div><div class="preview-phone"><div class="preview-backdrop"></div><img src="${previewImage}" alt="Preview actor" /><div class="preview-gradient"></div><span class="preview-label">AI GENERATED</span><span class="preview-caption">${escapeHtml(state.flow.script || state.flow.brief)}</span><span class="preview-product-pip"><img src="${product.image}" alt="${escapeHtml(product.name)}" /></span><span class="preview-speaker">${state.flow.audioMode === 'upload' ? 'CUSTOM AUDIO' : 'VOICE MATCHED'}</span></div><div class="preview-meta"><div><span>Product</span><strong>${escapeHtml(product.name)}</strong></div><div><span>Shot</span><strong>${escapeHtml(selectedPlacement().title)}</strong></div><div><span>Length</span><strong>${escapeHtml(state.flow.duration)}</strong></div></div><div class="preview-note"><span>✦</span><p>Preview updates as you change the actor, product, placement, or voice.</p></div>`;
}

function renderWizard() {
  const stepList = $('#wizard-step-list');
  const panel = $('#wizard-panel');
  const preview = $('#preview-panel');
  const modeName = $('#rail-mode-name');
  const modeIcon = $('#rail-mode-icon');
  const ribbon = $('#mode-ribbon');
  const indicator = $('#wizard-page-indicator');
  const back = $('[data-action="wizard-back"]');
  const next = $('[data-action="wizard-next"]');
  if (!stepList || !panel || !preview) return;
  stepList.innerHTML = stepRail();
  panel.innerHTML = `<div class="wizard-panel-inner">${stepContent()}</div>`;
  preview.innerHTML = renderPreview();
  if (modeName) modeName.textContent = modeLabel(state.mode);
  if (modeIcon) modeIcon.textContent = state.mode === 'likeness' ? '◎' : '✦';
  if (ribbon) ribbon.innerHTML = `<span class="mode-ribbon-icon">${state.mode === 'likeness' ? '◎' : '✦'}</span><div><strong>${modeLabel(state.mode)} flow</strong><small>${state.mode === 'likeness' ? 'Use a portrait and reference performance.' : 'Choose a synthetic Indian actor.'}</small></div><span class="ribbon-estimate">${modeEstimate(state.mode)}</span>`;
  if (indicator) indicator.textContent = `Step ${state.flow.step} of 7`;
  if (back) back.disabled = state.flow.step === 1;
  if (next) next.innerHTML = state.flow.step === 7 ? (state.generationStatus === 'needs_review' ? 'Approve output' : state.generationStatus === 'completed' ? 'Export video' : 'Generate video') + ' <span aria-hidden="true">→</span>' : 'Continue <span aria-hidden="true">→</span>';
  $$('img').forEach((image) => { if (image.src) imageFallback(image); });
}

function renderProductLibrary() {
  const target = $('#product-library-grid');
  if (!target) return;
  target.innerHTML = fixture.products.map((product) => `<article class="library-card"><div class="library-card-image"><img src="${product.image}" alt="${escapeHtml(product.name)} product" /></div><div class="library-card-copy"><span class="badge badge-blue">${escapeHtml(product.category)}</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p><div class="card-footer"><strong>${escapeHtml(product.price)}</strong><span>Used in ${fixture.videos.filter((video) => video.product === product.name).length || 1} videos</span></div></div></article>`).join('');
  $$('img', target).forEach(imageFallback);
}

function renderCreatorLibrary() {
  const target = $('#creator-library-grid');
  if (!target) return;
  target.innerHTML = fixture.actors.map((actor) => `<article class="creator-card"><div class="creator-image"><img src="${actor.image}" alt="${escapeHtml(actor.name)}" /><span class="availability">Available</span></div><div class="creator-card-body"><div><h3>${escapeHtml(actor.name)}</h3><p>${escapeHtml(actor.city)}</p></div><span class="creator-score">★ ${actor.fit}</span><div class="creator-tags">${actor.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div><button class="button button-outline full-width" type="button" data-actor-id="${actor.id}" data-route="new-video" data-mode-choice="ai_actor">Use actor</button></div></article>`).join('');
  $$('img', target).forEach(imageFallback);
}

function renderActorDialog() {
  const target = $('#actor-dialog-grid');
  if (!target) return;
  const search = state.actorSearch.toLowerCase();
  const actors = fixture.actors.filter((actor) => {
    const matchesSearch = !search || `${actor.name} ${actor.city} ${actor.tags.join(' ')}`.toLowerCase().includes(search);
    const matchesLanguage = state.actorLanguage === 'all' || actor.tags.includes(state.actorLanguage);
    return matchesSearch && matchesLanguage;
  });
  target.innerHTML = actors.length ? actors.map((actor) => `<button class="actor-choice ${state.flow.actorId === actor.id ? 'selected' : ''}" type="button" data-actor-id="${actor.id}"><img src="${actor.image}" alt="${escapeHtml(actor.name)}" /><span class="actor-choice-copy"><strong>${escapeHtml(actor.name)}</strong><small>${escapeHtml(actor.city)} · ${escapeHtml(actor.tags.join(' · '))}</small></span><span class="actor-choice-score">★ ${actor.fit}</span></button>`).join('') : `<div class="empty-state"><span>⌕</span><strong>No actors found</strong><p>Try another language or name.</p></div>`;
  $$('img', target).forEach(imageFallback);
}

function renderDetailView() {
  const target = $('#video-detail-content');
  const video = fixture.videos.find((item) => item.id === state.selectedVideoId) || fixture.videos[0];
  if (!target) return;
  target.innerHTML = `<button class="button button-ghost detail-back" type="button" data-route="videos">← Back to videos</button><div class="detail-heading"><div><p class="kicker">Video detail <span class="status-pip"></span> Updated 18 min ago</p><h1 id="detail-heading">${escapeHtml(video.title)}.</h1><p class="heading-copy">${escapeHtml(video.product)} · ${escapeHtml(video.language)} · ${escapeHtml(video.duration)} · ${escapeHtml(video.mode === 'likeness' ? 'Your likeness' : 'AI actor')}</p></div><div class="detail-actions"><button class="button button-outline" type="button" data-dialog="share-dialog">Share</button><button class="button button-dark" type="button" data-dialog="export-dialog">Export</button></div></div><div class="detail-summary-grid"><section class="panel detail-media-card"><div class="detail-video-placeholder" style="background-image:linear-gradient(180deg,rgba(16,35,111,.05),rgba(16,35,111,.6)),url('${video.image}')"><span class="ai-label">AI VIDEO · 9:16</span><span class="preview-play">▶</span><span class="detail-product-pip"><img src="${video.image}" alt="${escapeHtml(video.product)}" /></span></div><div class="video-actions"><button class="button button-outline" type="button" data-toast="Video playback is simulated in this wireframe.">Play preview</button><button class="button button-ghost" type="button" data-action="duplicate-video">Duplicate</button><span class="badge ${statusClass(video.status)}">${escapeHtml(video.statusLabel)}</span></div></section><section class="panel detail-info-card"><p class="section-kicker">Generation details</p><div class="detail-stat-row"><div><span>Mode</span><strong>${escapeHtml(video.mode === 'likeness' ? 'Your likeness' : 'AI actor')}</strong></div><div><span>Output count</span><strong>${video.outputs || 0} versions</strong></div></div><div class="detail-stat-row"><div><span>Placement</span><strong>${escapeHtml(video.placement)}</strong></div><div><span>Credits</span><strong>${video.outputs ? video.outputs : 1}</strong></div></div><div class="detail-compliance"><span>✓</span><div><strong>Review checkpoint passed</strong><p>AI disclosure, product facts, and provenance metadata are attached.</p></div></div></section></div><div class="detail-lower-grid"><section class="panel detail-storyboard"><div class="panel-header"><div><p class="section-kicker">Shot review</p><h2>Product moment options</h2></div><button class="button button-ghost" type="button" data-route="new-video">Create variation ↗</button></div><div class="mini-scenes">${fixture.placements.map((placement, index) => `<div class="mini-scene"><div class="mini-scene-image placement-${placement.id}"><span>${index + 1}</span><strong>${placement.icon}</strong></div><strong>${placement.title}</strong><small>${placement.id === 'present' ? 'Selected' : 'Available option'}</small></div>`).join('')}</div></section><section class="panel activity-panel"><div class="panel-header"><div><p class="section-kicker">Activity</p><h2>Latest updates</h2></div></div><div class="activity-list"><div><span class="activity-dot done"></span><p><strong>Provenance attached</strong><small>18 min ago</small></p></div><div><span class="activity-dot done"></span><p><strong>Voice match checked</strong><small>21 min ago</small></p></div><div><span class="activity-dot"></span><p><strong>Review link available</strong><small>Today</small></p></div></div></section></div>`;
  $$('img', target).forEach(imageFallback);
}

function routeLabel(route) {
  return ({ dashboard: 'Overview', videos: 'Videos', products: 'Products', creators: 'AI actors', assets: 'Asset library', subscription: 'Subscription', settings: 'Settings', 'new-video': 'New video', 'video-detail': 'Video detail' })[route] || 'Overview';
}

function showView(route) {
  state.view = route;
  $$('.view-section').forEach((section) => section.classList.toggle('active', section.dataset.viewSection === route));
  const activeRoute = route === 'new-video' || route === 'video-detail' ? 'videos' : route;
  $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.route === activeRoute));
  const breadcrumbs = $('#breadcrumbs');
  if (breadcrumbs) breadcrumbs.innerHTML = `<span>Workspace</span><span aria-hidden="true">/</span><strong>${routeLabel(route)}</strong>`;
  syncModeLauncher();
  if (route === 'dashboard' || route === 'videos') renderVideos();
  if (route === 'products') renderProductLibrary();
  if (route === 'creators') renderCreatorLibrary();
  if (route === 'new-video') renderWizard();
  if (route === 'video-detail') renderDetailView();
  $('#sidebar')?.classList.remove('open');
  $('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigate(route) {
  const nextHash = route === 'dashboard' ? '#dashboard' : `#${route}`;
  if (window.location.hash === nextHash) showView(route);
  else window.location.hash = nextHash;
}

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog) return;
  if (id === 'actor-dialog') renderActorDialog();
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  document.body.classList.add('modal-open');
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
  if (!$('dialog[open]')) document.body.classList.remove('modal-open');
}

function showToast(message, kind = 'success') {
  const region = $('#toast-region');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = `toast ${kind === 'loading' ? 'toast-loading' : kind === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), kind === 'loading' ? 2200 : 3400);
}

function fakeAutosave() {
  const saveStatus = $('#save-status');
  if (!saveStatus) return;
  saveStatus.textContent = 'Saving draft…';
  window.setTimeout(() => { saveStatus.textContent = 'Draft saved just now'; }, 550);
}

function canLeaveStep() {
  if (state.flow.step === 1 && state.mode === 'likeness' && !state.flow.consentConfirmed) {
    showToast('Confirm likeness consent before continuing.', 'error');
    $('#consent-confirmed')?.focus();
    return false;
  }
  if (state.flow.step === 1 && state.mode === 'likeness' && (!state.flow.portraitName || !state.flow.referenceVideoName)) {
    showToast('Add a portrait and reference video to continue.', 'error');
    return false;
  }
  return true;
}

function goToStep(step) {
  if (step > state.flow.step && !canLeaveStep()) return;
  state.flow.step = Math.max(1, Math.min(7, step));
  fakeAutosave();
  renderWizard();
}

function handleGenerate() {
  if (state.generationStatus === 'needs_review') { state.generationStatus = 'completed'; state.generationProgress = 100; renderWizard(); showToast('Video marked ready for export.'); return; }
  if (state.generationStatus === 'completed') { openDialog('export-dialog'); return; }
  if (state.flow.step !== 7 && !canLeaveStep()) return;
  state.flow.step = 7;
  state.generationStatus = 'queued';
  state.generationProgress = 12;
  renderWizard();
  showToast('Generation queued — your video is being prepared.', 'loading');
  window.setTimeout(() => { state.generationStatus = 'running'; state.generationProgress = 58; renderWizard(); }, 450);
  window.setTimeout(() => { state.generationStatus = 'needs_review'; state.generationProgress = 100; renderWizard(); showToast('Video ready for review.'); }, 1500);
}

function updateFlowField(field, value) {
  if (field in state.flow) state.flow[field] = value;
  fakeAutosave();
}

function handleProductSubmit(form) {
  const data = new FormData(form);
  const name = String(data.get('product-name') || 'New product').trim();
  const product = { id: `product-${Date.now()}`, name, category: String(data.get('product-category') || 'Product'), price: String(data.get('product-price') || 'Price on request'), image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=85', description: String(data.get('product-description') || 'Product details ready for a new video.') };
  fixture.products.unshift(product);
  state.flow.productId = product.id;
  form.reset();
  closeDialog($('#product-dialog'));
  renderProductLibrary();
  if (state.view === 'new-video') renderWizard();
  showToast(`${name} added to your product shelf.`);
}

function handleRouteFromHash() {
  const rawRoute = window.location.hash.replace('#', '') || 'dashboard';
  const aliases = { campaigns: 'videos', 'new-campaign': 'new-video', 'campaign-detail': 'video-detail' };
  const supported = ['dashboard', 'videos', 'products', 'creators', 'assets', 'subscription', 'settings', 'new-video', 'video-detail'];
  const route = aliases[rawRoute] || rawRoute;
  showView(supported.includes(route) ? route : 'dashboard');
}

document.addEventListener('click', (event) => {
  const workspaceTrigger = event.target.closest('[data-workspace-trigger]');
  if (workspaceTrigger) { event.preventDefault(); toggleWorkspaceMenu(); return; }
  const workspaceOption = event.target.closest('[data-workspace-option]');
  if (workspaceOption) { state.workspaceId = workspaceOption.dataset.workspaceOption; updateWorkspaceUI(); closeWorkspaceMenu(); showToast(`Switched to ${fixture.workspaces.find((item) => item.id === state.workspaceId).name}.`); return; }

  const modeTrigger = event.target.closest('[data-mode-choice]');
  if (modeTrigger) { setMode(modeTrigger.dataset.modeChoice); }

  const routeTrigger = event.target.closest('[data-route]');
  if (routeTrigger) {
    event.preventDefault();
    const actorId = routeTrigger.dataset.actorId;
    if (actorId) { state.flow.actorId = actorId; state.flow.voice = `${selectedActor().name} · ${state.flow.language}`; }
    navigate(routeTrigger.dataset.route);
    return;
  }

  const dialogTrigger = event.target.closest('[data-dialog]');
  if (dialogTrigger) { openDialog(dialogTrigger.dataset.dialog); return; }
  const closeTrigger = event.target.closest('[data-close-dialog]');
  if (closeTrigger) { closeDialog(closeTrigger.closest('dialog')); return; }
  const toastTrigger = event.target.closest('[data-toast]');
  if (toastTrigger) { showToast(toastTrigger.dataset.toast); return; }

  const videoItem = event.target.closest('[data-video-id]');
  if (videoItem && !event.target.closest('button[data-route]')) { state.selectedVideoId = videoItem.dataset.videoId; navigate('video-detail'); return; }

  const wizardStep = event.target.closest('[data-wizard-step]');
  if (wizardStep) { goToStep(Number(wizardStep.dataset.wizardStep)); return; }
  const productChoice = event.target.closest('[data-product-id]');
  if (productChoice) { state.flow.productId = productChoice.dataset.productId; fakeAutosave(); renderWizard(); return; }
  const actorChoice = event.target.closest('[data-actor-id]');
  if (actorChoice) { state.flow.actorId = actorChoice.dataset.actorId; state.flow.voice = `${selectedActor().name} · ${state.flow.language}`; closeDialog($('#actor-dialog')); renderWizard(); showToast(`${selectedActor().name} selected.`); return; }
  const placementChoice = event.target.closest('[data-placement]');
  if (placementChoice) { state.flow.placement = placementChoice.dataset.placement; fakeAutosave(); renderWizard(); return; }
  const durationChoice = event.target.closest('[data-duration]');
  if (durationChoice) { state.flow.duration = durationChoice.dataset.duration; fakeAutosave(); renderWizard(); return; }

  const action = event.target.closest('[data-action]');
  if (action) {
    const name = action.dataset.action;
    if (name === 'wizard-next') { if (state.flow.step === 7) handleGenerate(); else goToStep(state.flow.step + 1); }
    if (name === 'wizard-back') goToStep(state.flow.step - 1);
    if (name === 'generate-video') handleGenerate();
    if (name === 'approve-generation') { state.generationStatus = 'completed'; renderWizard(); showToast('Video marked ready for export.'); }
    if (name === 'retry-generation') { state.generationStatus = 'idle'; state.generationProgress = 0; renderWizard(); showToast('Inputs restored. Ready to retry.'); }
    if (name === 'simulate-failure') { state.generationStatus = 'failed'; renderWizard(); showToast('A recoverable provider error was added to the demo.', 'error'); }
    if (name === 'edit-placement') { state.flow.step = 3; state.generationStatus = 'idle'; renderWizard(); }
    if (name === 'duplicate-video') { setMode(state.mode); navigate('new-video'); showToast('A new draft was created from this video.'); }
    return;
  }

  const videoTab = event.target.closest('[data-video-tab]');
  if (videoTab) { state.videoFilter = videoTab.dataset.videoTab; $$('.filter-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.videoTab === state.videoFilter)); renderVideos(); return; }
  const upload = event.target.closest('[data-upload]');
  if (upload) { if (upload.dataset.upload === 'portrait') state.flow.portraitName = 'portrait-mayur.jpg'; if (upload.dataset.upload === 'reference') state.flow.referenceVideoName = 'reference-clip.mp4'; if (upload.dataset.upload === 'product') showToast('Product image selected for upload.'); fakeAutosave(); if (state.view === 'new-video') renderWizard(); return; }
  if (event.target.closest('[data-sidebar-open]')) { $('#sidebar')?.classList.add('open'); return; }
  if (event.target.closest('[data-sidebar-close]')) { $('#sidebar')?.classList.remove('open'); return; }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'dashboard-search') { state.videoSearch = event.target.value; renderVideos(); }
  if (event.target.id === 'actor-search') { state.actorSearch = event.target.value; renderActorDialog(); }
  const field = event.target.dataset.flowField;
  if (field) { updateFlowField(field, event.target.value); }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'dashboard-filter') { state.videoFilter = event.target.value; renderVideos(); }
  if (event.target.id === 'actor-language-filter') { state.actorLanguage = event.target.value; renderActorDialog(); }
  const check = event.target.dataset.flowCheck;
  if (check) { state.flow[check] = event.target.checked; fakeAutosave(); }
  const toggle = event.target.dataset.flowToggle;
  if (toggle) { state.flow[toggle] = event.target.checked; fakeAutosave(); }
  const audioMode = event.target.dataset.audioMode;
  if (audioMode) { state.flow.audioMode = audioMode; fakeAutosave(); renderWizard(); }
});

document.addEventListener('submit', (event) => { if (event.target.id === 'product-form') { event.preventDefault(); handleProductSubmit(event.target); } });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeWorkspaceMenu(); });
$$('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog); }));
window.addEventListener('hashchange', handleRouteFromHash);

renderWorkspaceMenu();
updateWorkspaceUI();
renderVideos();
handleRouteFromHash();
