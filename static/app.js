const $ = selector => document.querySelector(selector);
const textarea = $('#notice-text');
const imageInput = $('#image-file');
const errorBox = $('#error');
const result = $('#result');
const staticPages = location.hostname.endsWith('github.io');
const languageCodes = { English: 'en-IN', Hindi: 'hi-IN', Bengali: 'bn-IN', Tamil: 'ta-IN', Telugu: 'te-IN', Marathi: 'mr-IN', Urdu: 'ur-PK' };
let attachedImage = null;
let sampleResultActive = false;

const sampleNotice = `SOUTH ASIAN UNIVERSITY\nSTUDENT AFFAIRS OFFICE\n\nNOTICE: Need-based fee support — Autumn 2026\n\nEligible undergraduate students whose household income is below ₹4,00,000 per year may apply for need-based fee support. Submit the completed application form, family income certificate issued by a competent authority, and a copy of your university identity card to the Student Affairs Office, Room 204, by 5:00 PM on 14 November 2026. Applications received after the deadline will not be considered. Shortlisted applicants may be asked to attend a brief verification meeting. The meeting schedule will be shared by email.\n\nFor the form, visit the Student Affairs Office or email studentaffairs@sau.example.edu. Issued: 28 October 2026`;
const sampleBase = {
  title: 'Apply for need-based fee support', summary: 'Eligible undergraduate students can apply for fee support if their household income is below ₹4,00,000 per year.',
  language: 'English', notice_type: 'fee', confidence: 'high',
  actions: [{ task: 'Submit the completed form, income certificate, and university ID copy to Student Affairs, Room 204.', deadline: '14 Nov 2026 · 5:00 PM', deadline_iso: '2026-11-14', consequence: 'Applications received after the deadline will not be considered.', evidence: { text: 'by 5:00 PM on 14 November 2026', verified: true, status: 'Verified in notice' } }],
  requirements: [
    { item: 'Completed application form', evidence: { text: 'completed application form', verified: true, status: 'Verified in notice' } },
    { item: 'Family income certificate from a competent authority', evidence: { text: 'family income certificate issued by a competent authority', verified: true, status: 'Verified in notice' } },
    { item: 'Copy of university identity card', evidence: { text: 'a copy of your university identity card', verified: true, status: 'Verified in notice' } }
  ],
  unclear: ['Shortlisted applicants may need a verification meeting; the date is not stated.']
};
const sampleTranslations = {
  English: {
    title: 'Apply for need-based fee support', translated_summary: 'Eligible undergraduates can apply for fee support if household income is below ₹4,00,000 a year. Submit the form and documents by 14 November 2026 at 5:00 PM.', who: 'Undergraduate students with household income below ₹4,00,000 per year', task: 'Submit the form, income certificate, and university ID copy to Student Affairs, Room 204.', requirements: ['Completed application form', 'Family income certificate from a competent authority', 'Copy of university identity card']
  },
  Hindi: {
    title: 'आवश्यकता-आधारित शुल्क सहायता के लिए आवेदन करें', translated_summary: 'पात्र स्नातक छात्र शुल्क सहायता के लिए आवेदन कर सकते हैं, यदि उनके परिवार की वार्षिक आय ₹4,00,000 से कम है। फ़ॉर्म और दस्तावेज़ 14 नवंबर 2026 को शाम 5 बजे तक जमा करें।', who: '₹4,00,000 से कम वार्षिक पारिवारिक आय वाले स्नातक छात्र', task: 'भरा हुआ फ़ॉर्म, आय प्रमाणपत्र और विश्वविद्यालय पहचान पत्र की प्रति छात्र मामलों के कार्यालय, कक्ष 204 में जमा करें।', requirements: ['पूरा भरा आवेदन फ़ॉर्म', 'सक्षम प्राधिकारी द्वारा जारी पारिवारिक आय प्रमाणपत्र', 'विश्वविद्यालय पहचान पत्र की प्रति']
  },
  Bengali: {
    title: 'প্রয়োজনভিত্তিক ফি সহায়তার জন্য আবেদন করুন', translated_summary: 'পরিবারের বার্ষিক আয় ₹৪,০০,০০০-এর কম হলে স্নাতক শিক্ষার্থীরা ফি সহায়তার জন্য আবেদন করতে পারেন। ফর্ম ও নথি ১৪ নভেম্বর ২০২৬ বিকেল ৫টার মধ্যে জমা দিন।', who: 'বার্ষিক পারিবারিক আয় ₹৪,০০,০০০-এর কম এমন স্নাতক শিক্ষার্থী', task: 'পূরণ করা ফর্ম, আয়ের শংসাপত্র এবং বিশ্ববিদ্যালয়ের পরিচয়পত্রের কপি ছাত্র বিষয়ক দপ্তর, কক্ষ ২০৪-এ জমা দিন।', requirements: ['পূরণ করা আবেদন ফর্ম', 'সক্ষম কর্তৃপক্ষের দেওয়া পারিবারিক আয়ের শংসাপত্র', 'বিশ্ববিদ্যালয়ের পরিচয়পত্রের কপি']
  },
  Tamil: {
    title: 'தேவை அடிப்படையிலான கட்டண உதவிக்கு விண்ணப்பிக்கவும்', translated_summary: 'குடும்பத்தின் ஆண்டு வருமானம் ₹4,00,000-க்கும் குறைவாக இருந்தால், தகுதியுள்ள இளங்கலை மாணவர்கள் கட்டண உதவிக்கு விண்ணப்பிக்கலாம். படிவத்தையும் ஆவணங்களையும் 14 நவம்பர் 2026 மாலை 5 மணிக்குள் சமர்ப்பிக்கவும்.', who: 'ஆண்டு குடும்ப வருமானம் ₹4,00,000-க்கும் குறைவான இளங்கலை மாணவர்கள்', task: 'பூர்த்தி செய்த விண்ணப்பம், வருமானச் சான்றிதழ், பல்கலைக்கழக அடையாள அட்டை நகலை மாணவர் விவகார அலுவலகம், அறை 204-ல் சமர்ப்பிக்கவும்.', requirements: ['பூர்த்தி செய்த விண்ணப்பப் படிவம்', 'தகுதியான அதிகாரி வழங்கிய குடும்ப வருமானச் சான்றிதழ்', 'பல்கலைக்கழக அடையாள அட்டை நகல்']
  },
  Telugu: {
    title: 'అవసర ఆధారిత ఫీజు సహాయం కోసం దరఖాస్తు చేయండి', translated_summary: 'కుటుంబ వార్షిక ఆదాయం ₹4,00,000 కంటే తక్కువైతే అర్హులైన అండర్‌గ్రాడ్యుయేట్ విద్యార్థులు ఫీజు సహాయం కోసం దరఖాస్తు చేయవచ్చు. ఫారమ్, పత్రాలను 14 నవంబర్ 2026 సాయంత్రం 5 గంటలలోపు సమర్పించండి.', who: 'కుటుంబ వార్షిక ఆదాయం ₹4,00,000 కంటే తక్కువ ఉన్న అండర్‌గ్రాడ్యుయేట్ విద్యార్థులు', task: 'పూర్తి చేసిన ఫారమ్, ఆదాయ ధృవీకరణ పత్రం, యూనివర్సిటీ గుర్తింపు కార్డు కాపీని విద్యార్థి వ్యవహారాల కార్యాలయం, గది 204లో సమర్పించండి.', requirements: ['పూర్తి చేసిన దరఖాస్తు ఫారమ్', 'అధికార సంస్థ జారీ చేసిన కుటుంబ ఆదాయ ధృవీకరణ పత్రం', 'యూనివర్సిటీ గుర్తింపు కార్డు కాపీ']
  },
  Marathi: {
    title: 'गरजेनुसार शुल्क सहाय्यासाठी अर्ज करा', translated_summary: 'कुटुंबाचे वार्षिक उत्पन्न ₹4,00,000 पेक्षा कमी असल्यास पात्र पदवीपूर्व विद्यार्थी शुल्क सहाय्यासाठी अर्ज करू शकतात. अर्ज आणि कागदपत्रे 14 नोव्हेंबर 2026 रोजी संध्याकाळी 5 वाजेपर्यंत जमा करा.', who: 'वार्षिक कौटुंबिक उत्पन्न ₹4,00,000 पेक्षा कमी असलेले पदवीपूर्व विद्यार्थी', task: 'भरलेला अर्ज, उत्पन्नाचा दाखला आणि विद्यापीठ ओळखपत्राची प्रत विद्यार्थी व्यवहार कार्यालय, कक्ष 204 येथे जमा करा.', requirements: ['भरलेला अर्ज', 'सक्षम प्राधिकरणाने दिलेला कौटुंबिक उत्पन्नाचा दाखला', 'विद्यापीठ ओळखपत्राची प्रत']
  },
  Urdu: {
    title: 'ضرورت کی بنیاد پر فیس معاونت کے لیے درخواست دیں', translated_summary: 'اگر خاندان کی سالانہ آمدنی ₹4,00,000 سے کم ہو تو اہل انڈرگریجویٹ طلبہ فیس معاونت کے لیے درخواست دے سکتے ہیں۔ فارم اور دستاویزات 14 نومبر 2026 شام 5 بجے تک جمع کرائیں۔', who: 'وہ انڈرگریجویٹ طلبہ جن کی خاندانی سالانہ آمدنی ₹4,00,000 سے کم ہے', task: 'مکمل فارم، آمدنی کا سرٹیفکیٹ اور یونیورسٹی شناختی کارڈ کی نقل طلبہ امور کے دفتر، کمرہ 204 میں جمع کرائیں۔', requirements: ['مکمل درخواست فارم', 'مجاز ادارے کا جاری کردہ خاندانی آمدنی کا سرٹیفکیٹ', 'یونیورسٹی شناختی کارڈ کی نقل']
  }
};

function safe(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function currentSample() {
  const translation = sampleTranslations[$('#language').value] || sampleTranslations.English;
  return { ...sampleBase, ...translation, actions: sampleBase.actions.map(action => ({ ...action, task: translation.task })), requirements: sampleBase.requirements.map((item, index) => ({ ...item, item: translation.requirements[index] })) };
}
function setSample() {
  sampleResultActive = true;
  textarea.value = sampleNotice;
  $('#char-count').textContent = `${textarea.value.length.toLocaleString()} / 10,000`;
  attachedImage = null;
  imageInput.value = '';
  $('#file-label').textContent = 'Add a photo';
  errorBox.hidden = true;
  renderResult(currentSample(), true);
}
$('#sample-btn').addEventListener('click', setSample);
$('#language').addEventListener('change', () => { if (sampleResultActive) renderResult(currentSample(), true); });
textarea.addEventListener('input', () => {
  if (textarea.value.length > 10000) textarea.value = textarea.value.slice(0, 10000);
  $('#char-count').textContent = `${textarea.value.length.toLocaleString()} / 10,000`;
  errorBox.hidden = true;
  sampleResultActive = false;
  result.hidden = true;
  $('#result-empty').hidden = false;
});
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) { showError('That image is larger than 8 MB. Choose a smaller one.'); imageInput.value = ''; return; }
  attachedImage = file;
  $('#file-label').textContent = file.name;
  sampleResultActive = false;
  result.hidden = true;
  $('#result-empty').hidden = false;
});
$('#analyze-btn').addEventListener('click', analyzeNotice);

async function analyzeNotice() {
  errorBox.hidden = true;
  if (staticPages) { showError('This GitHub Pages site is a sample preview. Run NoticeWise locally with an API key for live analysis.'); return; }
  const text = textarea.value.trim();
  if (!text && !attachedImage) { showError('Paste notice text or add a photo first.'); return; }
  const button = $('#analyze-btn');
  button.disabled = true;
  button.querySelector('span:first-child').textContent = 'Reading notice…';
  $('#result-empty').hidden = true;
  result.hidden = true;
  $('#result-panel').insertAdjacentHTML('beforeend', '<div class="loading" id="loading"><span class="loader"></span>Finding the useful details…</div>');
  try {
    const image = attachedImage ? { mime: attachedImage.type, data: await toBase64(attachedImage) } : null;
    const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, language: $('#language').value, readingLevel: $('#reading-level').value, image }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not analyze that notice.');
    sampleResultActive = false;
    renderResult(data, false);
  } catch (error) {
    $('#result-empty').hidden = false;
    showError(error.message || 'Could not analyze that notice.');
  } finally {
    $('#loading')?.remove();
    button.disabled = false;
    button.querySelector('span:first-child').textContent = 'Make it clear';
  }
}
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function normalizeForMatch(value) {
  return String(value || '').normalize('NFKC').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}
function findQuoteRange(source, quote) {
  const normalized = normalizeForMatch(source);
  const needle = normalizeForMatch(quote);
  const index = normalized.indexOf(needle);
  if (index < 0 || !needle) return null;
  let out = '', positions = [], pendingSpace = false, spacePosition = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (/\s/.test(char)) { if (out && !pendingSpace) { pendingSpace = true; spacePosition = i; } continue; }
    if (pendingSpace) { out += ' '; positions.push(spacePosition); pendingSpace = false; }
    out += char.normalize('NFKC').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').toLocaleLowerCase();
    for (let j = 0; j < out.length - positions.length; j++) positions.push(i);
  }
  const start = positions[index];
  const end = positions[index + needle.length - 1];
  return Number.isInteger(start) && Number.isInteger(end) ? { start, end: end + 1 } : null;
}
function jumpToQuote(quote) {
  const range = findQuoteRange(textarea.value, quote);
  if (!range) return showError('That quote is not present in the pasted notice.');
  textarea.focus();
  textarea.setSelectionRange(range.start, range.end);
}
function evidenceHtml(evidence) {
  if (!evidence?.text) return '<span class="evidence-status unverified">No quote returned</span>';
  const badge = evidence.verified ? '<span class="evidence-status verified">✓ Verified</span>' : `<span class="evidence-status unverified">${safe(evidence.status || 'Check source')}</span>`;
  const link = evidence.verified ? `<button type="button" class="evidence-jump" data-evidence="${safe(evidence.text)}">Find in notice</button>` : '';
  return `<div class="evidence-row"><span class="quote">“${safe(evidence.text)}”</span><span class="evidence-meta">${badge}${link}</span></div>`;
}
function dateInfo(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  const deadline = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(deadline.getTime())) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((deadline.getTime() - today.getTime()) / 86400000);
  return { days, label: days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : days === 1 ? '1 day left' : `${days} days left` };
}
function urgencyLabel(iso) {
  const info = dateInfo(iso);
  if (!info) return '';
  const cls = info.days < 0 ? 'overdue' : info.days <= 3 ? 'soon' : 'upcoming';
  return `<span class="urgency ${cls}">${safe(info.label)}</span>`;
}
function renderAction(action) {
  const calendar = action.deadline_iso ? `<button type="button" class="calendar-button" data-date="${safe(action.deadline_iso)}" data-title="${safe(action.task)}">＋ Add to calendar</button>` : '';
  return `<div class="action-item"><div class="action-task">${safe(action.task)}</div>${action.deadline ? `<div class="action-meta">◷ &nbsp;${safe(action.deadline)} ${urgencyLabel(action.deadline_iso)}</div>` : ''}${action.consequence ? `<div class="consequence"><strong>If missed:</strong> ${safe(action.consequence)}</div>` : ''}${evidenceHtml(action.evidence)}${calendar}</div>`;
}
function renderResult(data, isSample = false) {
  const actions = [...(data.actions || [])].sort((a, b) => (a.deadline_iso || '9999-99-99').localeCompare(b.deadline_iso || '9999-99-99'));
  const requirements = (data.requirements || []).map(item => `<div class="requirement-item"><span class="tag">${safe(item.item)}</span>${evidenceHtml(item.evidence)}</div>`).join('') || '<span class="tag">None listed</span>';
  const unclear = (data.unclear || []).map(item => `<div class="notice-flag">↗ &nbsp;${safe(item)}</div>`).join('');
  const typeLabel = ({ scholarship: 'Scholarship', fee: 'Fees', exam: 'Exam', event: 'Event', general: 'General', other: 'Other' })[data.notice_type] || 'Notice';
  const selectedCode = languageCodes[$('#language').value] || 'en-IN';
  result.lang = selectedCode;
  result.dir = $('#language').value === 'Urdu' ? 'rtl' : 'ltr';
  result.innerHTML = `<div class="result-header"><div><span class="step-label">YOUR CLARITY CARD</span><h2>${safe(data.title || 'Notice summary')}</h2></div><span class="type-pill">${safe(typeLabel)}</span>${isSample ? '<span class="sample-badge">SAMPLE PREVIEW</span>' : `<span class="confidence">${safe(data.confidence || 'review')} confidence</span>`}</div>
<div class="result-toolbar"><button type="button" data-result-action="read">◖ Read aloud</button><button type="button" data-result-action="copy">▣ Copy summary</button><button type="button" data-result-action="share">↗ Share</button></div>
<div class="summary-block"><span class="step-label">IN SHORT</span><p>${safe(data.translated_summary || data.summary || '')}</p><div class="action-meta"><strong>Notice language:</strong> ${safe(data.language || 'Not detected')} &nbsp;·&nbsp; <strong>Who it applies to:</strong> ${safe(data.who || 'Not stated')}</div></div>
<section class="result-section"><h3>What to do</h3>${actions.map(renderAction).join('') || '<div class="tag">No specific actions found</div>'}</section>
<section class="result-section"><h3>Have these ready</h3>${requirements}</section>
${unclear ? `<section class="result-section"><h3>Check before you act</h3>${unclear}</section>` : ''}
<details class="source-details"><summary>Show original notice</summary><pre>${safe(textarea.value || 'Image notice is available in the source file you selected.')}</pre></details>
<section class="qna-panel"><div><span class="step-label">ASK THE NOTICE</span><p>Get an answer grounded in the source, or a clear “not stated”.</p></div><form id="qa-form"><label class="sr-only" for="qa-question">Ask a question about this notice</label><input id="qa-question" maxlength="500" placeholder="e.g. Do I need to submit an original?" required><button class="primary-button" type="submit"><span>Ask</span><span class="button-arrow">→</span></button></form><div id="qa-response" role="status" hidden></div></section>
<div class="privacy-note">◉ &nbsp;Use this as a guide. Confirm details in the original notice.</div>`;
  result.hidden = false;
  $('#result-empty').hidden = true;
}

function makeCalendarFile(date, title) {
  const start = date.replaceAll('-', '');
  const next = new Date(`${date}T00:00:00`); next.setDate(next.getDate() + 1);
  const end = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`;
  const escapeIcs = value => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NoticeWise//Deadline Reminder//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${Date.now()}@noticewise`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escapeIcs(title)}`, 'DESCRIPTION:Deadline extracted from a notice. Confirm details in the original.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `noticewise-${date}.ics`; link.click(); URL.revokeObjectURL(url);
}
function summaryText() {
  const title = result.querySelector('.result-header h2')?.textContent || 'NoticeWise summary';
  const summary = result.querySelector('.summary-block p')?.textContent || '';
  const actions = [...result.querySelectorAll('.action-task')].map(item => `• ${item.textContent}`).join('\n');
  const dates = [...result.querySelectorAll('.action-meta')].map(item => item.textContent.trim()).join('\n');
  const requirements = [...result.querySelectorAll('.requirement-item .tag')].map(item => `• ${item.textContent}`).join('\n');
  return `${title}\n\n${summary}\n\nWhat to do:\n${actions}\n\nDates:\n${dates}\n\nHave ready:\n${requirements}\n\nConfirm details in the original notice.`;
}
async function askQuestion(form) {
  const responseBox = $('#qa-response');
  const question = $('#qa-question').value.trim();
  if (!question) return;
  if (staticPages) { responseBox.textContent = 'The public sample preview does not connect to a live AI service. Run NoticeWise locally to ask questions.'; responseBox.hidden = false; return; }
  const button = form.querySelector('button'); button.disabled = true; button.querySelector('span:first-child').textContent = 'Thinking…';
  responseBox.hidden = true;
  try {
    const image = attachedImage ? { mime: attachedImage.type, data: await toBase64(attachedImage) } : null;
    const response = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: textarea.value.trim(), question, image }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not answer that question.');
    responseBox.innerHTML = `<strong>${safe(data.answer)}</strong>${data.evidence?.text ? evidenceHtml(data.evidence) : ''}`;
    responseBox.hidden = false;
  } catch (error) {
    responseBox.textContent = error.message || 'Could not answer that question.';
    responseBox.hidden = false;
  } finally {
    button.disabled = false; button.querySelector('span:first-child').textContent = 'Ask';
  }
}
result.addEventListener('submit', event => {
  if (event.target.id === 'qa-form') { event.preventDefault(); askQuestion(event.target); }
});
result.addEventListener('click', async event => {
  const evidenceButton = event.target.closest('.evidence-jump');
  if (evidenceButton) return jumpToQuote(evidenceButton.dataset.evidence || '');
  const calendarButton = event.target.closest('.calendar-button');
  if (calendarButton) return makeCalendarFile(calendarButton.dataset.date, calendarButton.dataset.title || 'Notice deadline');
  const actionButton = event.target.closest('[data-result-action]');
  if (!actionButton) return;
  if (actionButton.dataset.resultAction === 'read') {
    if (!('speechSynthesis' in window)) return showError('Read aloud is not available in this browser.');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(summaryText());
    utterance.lang = languageCodes[$('#language').value] || 'en-IN';
    window.speechSynthesis.speak(utterance);
  } else if (actionButton.dataset.resultAction === 'copy') {
    try { await navigator.clipboard.writeText(summaryText()); actionButton.textContent = '✓ Copied'; }
    catch { showError('Clipboard access is unavailable. Select and copy the summary text.'); }
  } else if (actionButton.dataset.resultAction === 'share') {
    try { if (navigator.share) await navigator.share({ title: 'NoticeWise clarity card', text: summaryText() }); else { await navigator.clipboard.writeText(summaryText()); actionButton.textContent = '✓ Copied to share'; } }
    catch (error) { if (error.name !== 'AbortError') showError('Sharing is unavailable in this browser.'); }
  }
});
function showError(message) { errorBox.textContent = message; errorBox.hidden = false; }
if (staticPages) {
  $('#model-label').textContent = 'Sample preview · GitHub Pages';
  document.querySelector('.model-pill i').style.background = '#d19b48';
} else {
  fetch('/api/status').then(response => response.json()).then(status => {
    if (!status.configured) { $('#model-label').textContent = status.provider.startsWith('Local') ? 'Ollama · configure URL' : 'Gemma 4 · add API key'; document.querySelector('.model-pill i').style.background = '#d19b48'; }
    else $('#model-label').textContent = status.provider.startsWith('Local') ? `Local ${status.model}` : 'Gemma 4 connected';
  }).catch(() => {});
}
if (new URLSearchParams(location.search).get('sample') === '1') setSample();
