const fixture = {
  campaigns: [
    {
      id: 'crompton-dlx',
      title: 'Crompton Classic DLX',
      description: 'Hindi product education campaign for festive home refresh.',
      status: 'review',
      statusLabel: 'Needs review',
      platform: 'Instagram Reels',
      language: 'Hindi',
      objective: 'Product education',
      duration: '8–10 sec',
      date: '5 Oct 2026',
      image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85',
      product: 'Crompton Classic DLX',
      scenes: 4,
      videos: 3,
      actor: 'Aisha Mehta',
      actorInitials: 'AM'
    },
    {
      id: 'tea-campaign',
      title: 'Tea Campaign',
      description: 'An everyday chai ritual, told in a warm Indian English voice.',
      status: 'ready',
      statusLabel: 'Ready',
      platform: 'Instagram Reels',
      language: 'Indian English',
      objective: 'Awareness',
      duration: '8–10 sec',
      date: '4 Oct 2026',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85',
      product: 'Morning Brew Tea',
      scenes: 4,
      videos: 4,
      actor: 'Rohan Kapoor',
      actorInitials: 'RK'
    },
    {
      id: 'smoke',
      title: 'Smoke',
      description: 'A first draft for a problem-to-solution everyday comfort story.',
      status: 'draft',
      statusLabel: 'Draft',
      platform: 'YouTube Shorts',
      language: 'Hindi',
      objective: 'Conversion',
      duration: '20 sec',
      date: '3 Oct 2026',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85',
      product: 'AirPure Mini',
      scenes: 0,
      videos: 0,
      actor: 'Not selected',
      actorInitials: '—'
    },
    {
      id: 'demo',
      title: 'demo',
      description: 'A concept test with three prompts waiting for storyboard review.',
      status: 'generating',
      statusLabel: 'Generating',
      platform: 'TikTok',
      language: 'Hinglish',
      objective: 'Testing',
      duration: '8–10 sec',
      date: '2 Oct 2026',
      image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=85',
      product: 'Everyday Glow',
      scenes: 4,
      videos: 1,
      actor: 'Aisha Mehta',
      actorInitials: 'AM'
    }
  ],
  products: [
    { name: 'Crompton Classic DLX', category: 'Home & living', price: '₹3,499', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=85', description: 'Powerful air delivery with a premium metallic finish.' },
    { name: 'Morning Brew Tea', category: 'Food & beverage', price: '₹499', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=85', description: 'A bright everyday tea ritual with a warm finish.' },
    { name: 'Everyday Glow', category: 'Beauty & wellness', price: '₹899', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=85', description: 'A gentle daily skincare routine for busy mornings.' }
  ],
  actors: [
    { id: 'aisha', name: 'Aisha Mehta', city: 'Mumbai, India', nationality: 'Indian', fit: '4.9', tags: ['Hindi', 'Relatable'], image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=85' },
    { id: 'rohan', name: 'Rohan Kapoor', city: 'Delhi, India', nationality: 'Indian', fit: '4.8', tags: ['Hinglish', 'Energetic'], image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=85' },
    { id: 'meera', name: 'Meera Shah', city: 'Pune, India', nationality: 'Indian', fit: '4.9', tags: ['Marathi', 'Premium'], image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85' },
    { id: 'vikram', name: 'Vikram Rao', city: 'Bengaluru, India', nationality: 'Indian', fit: '4.7', tags: ['Kannada', 'Conversational'], image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=85' },
    { id: 'tara', name: 'Tara Singh', city: 'Chandigarh, India', nationality: 'Indian', fit: '4.8', tags: ['Punjabi', 'Warm'], image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=85' },
    { id: 'arjun', name: 'Arjun Nair', city: 'Kochi, India', nationality: 'Indian', fit: '4.7', tags: ['Malayalam', 'Premium'], image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=85' }
  ],
  concepts: [
    { title: 'The fan that changes the room', hook: '“Why does this room suddenly feel better?”', script: 'Aisha walks into the room, turns on the Classic DLX, and lets the change speak for itself. Warm, unforced, and rooted in a real home moment.', duration: '9 sec', fit: 'High fit', format: 'POV product experience' },
    { title: 'One small upgrade', hook: '“The home upgrade I wish I made sooner.”', script: 'A quick before-and-after story focused on a quiet motor, powerful air, and the feeling of a room becoming more comfortable.', duration: '10 sec', fit: 'Good fit', format: 'Authentic testimonial' },
    { title: 'The festive room reset', hook: '“Guests coming over? Start here.”', script: 'A festive preparation montage lands on the fan as the practical finishing touch that keeps the room cool while the family gathers.', duration: '8 sec', fit: 'Good fit', format: 'Problem → solution' }
  ],
  scenes: [
    { title: 'The hook', summary: 'Aisha enters a warm, lived-in room and pauses.', duration: '0–2 sec', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=85' },
    { title: 'The switch', summary: 'Close-up of the Classic DLX turning on above her.', duration: '2–4 sec', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=85' },
    { title: 'The difference', summary: 'A relaxed moment as the room feels cooler and calmer.', duration: '4–7 sec', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=85' },
    { title: 'The recommendation', summary: 'Aisha looks to camera with a clear, friendly CTA.', duration: '7–10 sec', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85' }
  ]
};

const state = {
  view: 'dashboard',
  step: 1,
  selectedCampaignId: 'crompton-dlx',
  campaignFilter: 'all',
  search: '',
  selectedConcept: 0,
  selectedActor: 0,
  generated: false,
  sceneVersions: [0, 0, 0, 0],
  conceptVersion: 0
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function imageFallback(image) {
  image.addEventListener('error', () => {
    image.removeAttribute('src');
    image.classList.add('image-failed');
  }, { once: true });
}

function campaignStatusClass(status) {
  return `status-${status}`;
}

function filteredCampaigns() {
  return fixture.campaigns.filter((campaign) => {
    const matchesFilter = state.campaignFilter === 'all' || campaign.status === state.campaignFilter;
    const haystack = `${campaign.title} ${campaign.product} ${campaign.platform} ${campaign.language}`.toLowerCase();
    return matchesFilter && haystack.includes(state.search.toLowerCase());
  });
}

function campaignRow(campaign) {
  return `<article class="campaign-row" data-campaign-id="${campaign.id}">
    <div class="campaign-thumb"><img src="${campaign.image}" alt="${escapeHtml(campaign.product)} campaign thumbnail" /></div>
    <div class="campaign-main"><strong>${escapeHtml(campaign.title)}</strong><span>${escapeHtml(campaign.product)} · ${escapeHtml(campaign.objective)}</span></div>
    <div class="campaign-meta"><strong>${escapeHtml(campaign.platform)}</strong><span>${escapeHtml(campaign.language)} · ${escapeHtml(campaign.duration)}</span></div>
    <div><span class="badge ${campaignStatusClass(campaign.status)}">${escapeHtml(campaign.statusLabel)}</span></div>
    <button class="icon-button" type="button" data-route="campaign-detail" aria-label="Open ${escapeHtml(campaign.title)}">↗</button>
  </article>`;
}

function campaignCard(campaign) {
  const avatar = campaign.actor === 'Not selected' ? '' : `<span class="avatar avatar-blue">${escapeHtml(campaign.actorInitials)}</span>`;
  return `<article class="campaign-card" data-campaign-id="${campaign.id}">
    <button class="campaign-card-cover" type="button" data-route="campaign-detail" aria-label="Open ${escapeHtml(campaign.title)}">
      <img src="${campaign.image}" alt="${escapeHtml(campaign.product)} campaign preview" />
      <span class="ai-label">AI CREATIVE</span><span class="badge campaign-status ${campaignStatusClass(campaign.status)}">${escapeHtml(campaign.statusLabel)}</span>
    </button>
    <div class="campaign-card-body"><div class="campaign-card-title"><h3>${escapeHtml(campaign.title)}</h3><button class="icon-button" type="button" aria-label="More actions for ${escapeHtml(campaign.title)}" data-toast="Campaign actions are available in the detail view.">•••</button></div>
      <p>${escapeHtml(campaign.description)}</p><div class="card-facts"><span class="card-fact">${escapeHtml(campaign.platform)}</span><span class="card-fact">${escapeHtml(campaign.language)}</span><span class="card-fact">${campaign.videos ? `${campaign.videos} videos` : 'Draft'}</span></div>
      <div class="card-footer"><span>${escapeHtml(campaign.date)} · ${campaign.scenes ? `${campaign.scenes} scenes` : 'Brief only'}</span><div class="card-avatars">${avatar}</div></div>
    </div>
  </article>`;
}

function renderCampaigns() {
  const list = $('#campaign-list');
  const empty = $('#campaign-empty');
  const campaigns = filteredCampaigns();
  if (list) list.innerHTML = campaigns.map(campaignRow).join('');
  if (empty) empty.hidden = campaigns.length > 0;
  const allGrid = $('#all-campaigns-grid');
  if (allGrid) allGrid.innerHTML = campaigns.map(campaignCard).join('');
  $$('.campaign-row img, .campaign-card img').forEach(imageFallback);
}

function renderProductLibrary() {
  const target = $('#product-library-grid');
  if (!target) return;
  target.innerHTML = fixture.products.map((product) => `<article class="library-card"><div class="library-card-image"><img src="${product.image}" alt="${escapeHtml(product.name)} product placeholder" /></div><div class="library-card-copy"><span class="badge badge-blue">${escapeHtml(product.category)}</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p><div class="card-footer"><strong>${escapeHtml(product.price)}</strong><span>Used in ${fixture.campaigns.filter((campaign) => campaign.product === product.name).length || 1} campaign</span></div></div></article>`).join('');
  $$('.library-card img').forEach(imageFallback);
}

function renderCreatorLibrary() {
  const target = $('#creator-library-grid');
  if (!target) return;
  target.innerHTML = fixture.actors.slice(0, 6).map((actor) => `<article class="creator-library-card"><div class="creator-library-image"><img src="${actor.image}" alt="${escapeHtml(actor.name)} Indian synthetic creator portrait" /></div><div class="creator-library-copy"><div class="tag-row"><h3>${escapeHtml(actor.name)}</h3><span class="badge badge-yellow">${actor.fit} fit</span></div><p>${escapeHtml(actor.city)} · ${escapeHtml(actor.nationality)} synthetic creator</p><div class="creator-tags"><span>India-first roster</span>${actor.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div></article>`).join('');
  $$('.creator-library-card img').forEach(imageFallback);
}

function renderActorDialog() {
  const target = $('#actor-dialog-grid');
  if (!target) return;
  target.innerHTML = fixture.actors.map((actor, index) => `<button class="actor-card ${index === state.selectedActor ? 'selected' : ''}" type="button" data-actor-id="${actor.id}"><img src="${actor.image}" alt="${escapeHtml(actor.name)} Indian synthetic creator portrait" /><span class="actor-selected-mark">✓</span><div class="actor-card-copy"><h3>${escapeHtml(actor.name)}</h3><p>${escapeHtml(actor.city)} · ${escapeHtml(actor.nationality)} creator · Fit score ${actor.fit}</p><div class="creator-tags"><span>India</span>${actor.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div></button>`).join('');
  $$('.actor-card img').forEach(imageFallback);
}

function renderConcepts() {
  const target = $('#concept-grid');
  if (!target) return;
  target.innerHTML = fixture.concepts.map((concept, index) => `<article class="concept-card ${index === state.selectedConcept ? 'selected' : ''}">
    <span class="concept-number">0${index + 1}</span><h3>${escapeHtml(concept.title)}</h3><p class="concept-hook">${escapeHtml(concept.hook)}</p><p class="concept-script">${escapeHtml(concept.script)}</p><div class="concept-scenes" aria-label="Four-scene plan"><span></span><span></span><span></span><span></span></div><div class="concept-meta"><span>${escapeHtml(concept.format)}</span><span>${escapeHtml(concept.duration)}</span></div><button class="button ${index === state.selectedConcept ? 'button-dark' : 'button-outline'} full-width" type="button" data-select-concept="${index}">${index === state.selectedConcept ? 'Selected concept ✓' : 'Select concept'}</button>
  </article>`).join('');
}

function sceneImage(scene, index) {
  const version = state.sceneVersions[index];
  return version ? `${scene.image}&v=${version}` : scene.image;
}

function renderStoryboard() {
  const target = $('#storyboard-grid');
  const miniTarget = $('#mini-scenes');
  if (target) target.innerHTML = fixture.scenes.map((scene, index) => `<article class="scene-card"><div class="scene-visual"><img src="${sceneImage(scene, index)}" alt="Scene ${index + 1}: ${escapeHtml(scene.title)}" /><span class="scene-number">${index + 1}</span><span class="scene-duration">${escapeHtml(scene.duration)}</span></div><div class="scene-copy"><h3>${escapeHtml(scene.title)}${state.sceneVersions[index] ? ' · refreshed' : ''}</h3><p>${escapeHtml(scene.summary)}</p><div class="scene-actions"><button class="button button-outline" type="button" data-scene-action="edit" data-scene-index="${index}">Edit</button><button class="icon-button" type="button" data-scene-action="regenerate" data-scene-index="${index}" aria-label="Regenerate ${escapeHtml(scene.title)}">↻</button></div></div></article>`).join('');
  if (miniTarget) miniTarget.innerHTML = fixture.scenes.map((scene, index) => `<div class="mini-scene"><div class="mini-scene-image"><img src="${sceneImage(scene, index)}" alt="${escapeHtml(scene.title)} preview" /><span>${index + 1}</span></div><strong>${escapeHtml(scene.title)}</strong><small>${escapeHtml(scene.duration)}</small></div>`).join('');
  $$('#storyboard-grid img, #mini-scenes img').forEach(imageFallback);
}

function updateActorSelection() {
  const actor = fixture.actors[state.selectedActor];
  const portrait = $('.creator-selected .creator-portrait img');
  const name = $('.creator-selected .creator-copy h3');
  const description = $('.creator-selected .creator-copy p');
  const tags = $('.creator-selected .creator-tags');
  if (portrait) { portrait.src = actor.image; portrait.alt = `${actor.name} Indian AI creator`; imageFallback(portrait); }
  if (name) name.textContent = actor.name;
  if (description) description.textContent = `${actor.tags[0]} voice direction, ${actor.tags[1].toLowerCase()} on camera, India-first roster.`;
  if (tags) tags.innerHTML = `<span>Indian synthetic actor</span>${actor.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}<span>${escapeHtml(actor.city)}</span>`;
}

function renderDetailView() {
  const campaign = fixture.campaigns.find((item) => item.id === state.selectedCampaignId) || fixture.campaigns[0];
  const heading = $('#detail-heading');
  const statusLine = $('#detail-status-line');
  const copy = $('#detail-heading-copy');
  const video = $('.detail-video-placeholder');
  const productPip = $('.detail-product-pip img');
  if (heading) heading.textContent = `${campaign.title}.`;
  if (statusLine) statusLine.innerHTML = `<span class="status-pip"></span> ${escapeHtml(campaign.statusLabel)} · Updated 18 min ago`;
  if (copy) copy.textContent = `${escapeHtml(campaign.platform)} · ${escapeHtml(campaign.language)} · ${escapeHtml(campaign.objective)} · ${campaign.videos || 0} generated variations`;
  if (video) video.style.backgroundImage = `linear-gradient(180deg, rgba(16,35,111,.05), rgba(16,35,111,.6)), url("${campaign.image}")`;
  if (productPip) { productPip.src = campaign.image; productPip.alt = `${campaign.product} campaign`; imageFallback(productPip); }
}

function setStep(step) {
  const safeStep = Math.max(1, Math.min(7, Number(step)));
  state.step = safeStep;
  $$('.wizard-step').forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.step) === safeStep));
  $$('.stepper-item').forEach((item) => {
    const itemStep = Number(item.dataset.goStep);
    item.classList.toggle('active', itemStep === safeStep);
    item.classList.toggle('complete', itemStep < safeStep);
  });
  const label = $('#current-step-label');
  if (label) label.textContent = String(safeStep);
  const saveStatus = $('#save-status');
  if (saveStatus) saveStatus.textContent = safeStep === 7 && state.generated ? 'All changes saved' : 'Draft saved just now';
  const footerBack = $('[data-action="wizard-back"]');
  const footerNext = $('[data-action="wizard-next"]');
  if (footerBack) footerBack.disabled = safeStep === 1;
  if (footerNext) footerNext.innerHTML = safeStep === 7 ? (state.generated ? 'Review campaign <span aria-hidden="true">→</span>' : 'Generate videos <span aria-hidden="true">→</span>') : 'Continue <span aria-hidden="true">→</span>';
  $('.wizard-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function routeLabel(route) {
  return ({ dashboard: 'Overview', campaigns: 'Campaigns', products: 'Products', creators: 'AI creators', assets: 'Asset library', subscription: 'Subscription', settings: 'Settings', 'new-campaign': 'New campaign', 'campaign-detail': 'Campaign detail' })[route] || 'Overview';
}

function showView(route) {
  state.view = route;
  $$('.view-section').forEach((section) => section.classList.toggle('active', section.dataset.viewSection === route));
  const activeRoute = route === 'new-campaign' || route === 'campaign-detail' ? 'campaigns' : route;
  $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.route === activeRoute));
  const breadcrumbs = $('#breadcrumbs');
  if (breadcrumbs) breadcrumbs.innerHTML = `<span>Workspace</span><span aria-hidden="true">/</span><strong>${routeLabel(route)}</strong>`;
  if (route === 'new-campaign') setStep(state.step);
  if (route === 'campaigns') renderCampaigns();
  if (route === 'products') renderProductLibrary();
  if (route === 'creators') renderCreatorLibrary();
  if (route === 'campaign-detail') { renderStoryboard(); renderDetailView(); }
  $('#sidebar')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
}

function syncModalLock() {
  if (!$('dialog[open]')) document.body.classList.remove('modal-open');
}

function showToast(message, kind = 'success') {
  const region = $('#toast-region');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = `toast ${kind === 'loading' ? 'toast-loading' : kind === 'error' ? 'toast-error' : ''}`;
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), kind === 'loading' ? 1900 : 3200);
}

function fakeAutosave() {
  const saveStatus = $('#save-status');
  if (!saveStatus) return;
  saveStatus.textContent = 'Saving draft…';
  window.setTimeout(() => { saveStatus.textContent = 'Draft saved just now'; }, 500);
}

function handleGenerate() {
  const button = $('[data-action="generate-video"]');
  const result = $('#generation-result');
  if (!button || !result) return;
  button.disabled = true;
  button.innerHTML = 'Generating 3 videos… <span aria-hidden="true">◌</span>';
  showToast('Generation queued — your three videos are being rendered.', 'loading');
  window.setTimeout(() => {
    state.generated = true;
    button.disabled = false;
    button.innerHTML = 'Generate 3 videos <span aria-hidden="true">→</span>';
    result.hidden = false;
    setStep(7);
    showToast('Generation complete. Your videos are ready for review.');
  }, 1100);
}

function handleRouteFromHash() {
  const route = window.location.hash.replace('#', '') || 'dashboard';
  const supported = ['dashboard', 'campaigns', 'products', 'creators', 'assets', 'subscription', 'settings', 'new-campaign', 'campaign-detail'];
  showView(supported.includes(route) ? route : 'dashboard');
}

document.addEventListener('click', (event) => {
  const routeTrigger = event.target.closest('[data-route]');
  if (routeTrigger) {
    event.preventDefault();
    if (routeTrigger.dataset.route === 'campaign-detail') {
      const campaignCard = routeTrigger.closest('[data-campaign-id]');
      if (campaignCard) state.selectedCampaignId = campaignCard.dataset.campaignId;
    }
    navigate(routeTrigger.dataset.route);
    return;
  }

  const dialogTrigger = event.target.closest('[data-dialog]');
  if (dialogTrigger) {
    event.preventDefault();
    openDialog(dialogTrigger.dataset.dialog);
    return;
  }

  const closeTrigger = event.target.closest('[data-close-dialog]');
  if (closeTrigger) {
    closeDialog(closeTrigger.closest('dialog'));
    return;
  }

  const toastTrigger = event.target.closest('[data-toast]');
  if (toastTrigger) {
    showToast(toastTrigger.dataset.toast);
    if (toastTrigger.hasAttribute('data-close-dialog')) closeDialog(toastTrigger.closest('dialog'));
    return;
  }

  const stepTrigger = event.target.closest('[data-go-step]');
  if (stepTrigger && state.view === 'new-campaign') { setStep(stepTrigger.dataset.goStep); return; }

  const tabTrigger = event.target.closest('[data-campaign-tab]');
  if (tabTrigger) {
    state.campaignFilter = tabTrigger.dataset.campaignTab;
    $$('.filter-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.campaignTab === state.campaignFilter));
    renderCampaigns();
    return;
  }

  const productTab = event.target.closest('[data-product-tab]');
  if (productTab) {
    const tab = productTab.dataset.productTab;
    $$('.dialog-tab').forEach((item) => item.classList.toggle('active', item.dataset.productTab === tab));
    $$('[data-product-panel]').forEach((panel) => { panel.hidden = panel.dataset.productPanel !== tab; });
    return;
  }

  const conceptSelect = event.target.closest('[data-select-concept]');
  if (conceptSelect) { state.selectedConcept = Number(conceptSelect.dataset.selectConcept); renderConcepts(); showToast(`Concept ${state.selectedConcept + 1} selected.`); return; }

  const sceneAction = event.target.closest('[data-scene-action]');
  if (sceneAction) {
    const sceneIndex = Number(sceneAction.dataset.sceneIndex);
    if (sceneAction.dataset.sceneAction === 'regenerate') {
      state.sceneVersions[sceneIndex] += 1;
      renderStoryboard();
      showToast(`Scene ${sceneIndex + 1} regenerated without changing the other scenes.`);
    } else {
      showToast(`Scene ${sceneIndex + 1} editor opened. Changes are simulated in this wireframe.`);
    }
    return;
  }

  const actorCard = event.target.closest('[data-actor-id]');
  if (actorCard) {
    state.selectedActor = fixture.actors.findIndex((actor) => actor.id === actorCard.dataset.actorId);
    renderActorDialog();
    return;
  }

  const preferenceChip = event.target.closest('.preference-chip');
  if (preferenceChip) { preferenceChip.classList.toggle('active'); fakeAutosave(); return; }

  const action = event.target.closest('[data-action]');
  if (action) {
    const actionName = action.dataset.action;
    if (actionName === 'wizard-next') {
      if (state.step < 7) setStep(state.step + 1);
      else if (state.generated) navigate('campaign-detail');
      else handleGenerate();
    } else if (actionName === 'wizard-back') { if (state.step > 1) setStep(state.step - 1); }
    else if (actionName === 'regenerate-concepts') { state.conceptVersion += 1; renderConcepts(); showToast('Three fresh concepts generated from your current brief.'); }
    else if (actionName === 'regenerate-storyboard') { state.sceneVersions = [1, 1, 1, 1]; renderStoryboard(); showToast('Storyboard refreshed while preserving your selected concept.'); }
    else if (actionName === 'generate-video') handleGenerate();
    else if (actionName === 'select-actor') { updateActorSelection(); closeDialog(action.closest('dialog')); fakeAutosave(); showToast(`${fixture.actors[state.selectedActor].name} is now your selected creator.`); }
    return;
  }

  const reset = event.target.closest('[data-reset-demo]');
  if (reset) window.location.reload();
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'campaign-search') { state.search = event.target.value; renderCampaigns(); }
  if (event.target.closest('[data-autosave-form]')) fakeAutosave();
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'campaign-filter') { state.campaignFilter = event.target.value; renderCampaigns(); }
  if (event.target.closest('[data-autosave-form]')) fakeAutosave();
});

$$('dialog').forEach((dialog) => {
  dialog.addEventListener('close', syncModalLock);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog); });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { const openDialogElement = $('dialog[open]'); if (openDialogElement) closeDialog(openDialogElement); }
});

$$('[data-product-form]').forEach((form) => form.addEventListener('submit', (event) => {
  event.preventDefault();
  closeDialog(form.closest('dialog'));
  showToast('Product saved to your library and selected for this campaign.');
  fakeAutosave();
}));

window.addEventListener('hashchange', handleRouteFromHash);
$('[data-sidebar-open]')?.addEventListener('click', () => $('#sidebar')?.classList.add('open'));
$('[data-sidebar-close]')?.addEventListener('click', () => $('#sidebar')?.classList.remove('open'));

renderCampaigns();
renderConcepts();
renderStoryboard();
renderProductLibrary();
renderCreatorLibrary();
handleRouteFromHash();
