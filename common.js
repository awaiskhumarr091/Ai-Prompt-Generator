
// ---------------------------------------------------------------
// All AI calls go to our own backend at /api/claude.
// The backend holds the API key and forwards the request to Anthropic.
// The browser never sees the key, and there is no CORS issue.
// ---------------------------------------------------------------
async function callClaude(content, opts={}){
  let res;
  try{
    res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content,
        system: opts.system || null,
        maxTokens: opts.maxTokens || 1000
      })
    });
  }catch(networkErr){
    throw new Error("Can't reach the server. Make sure you started it with `npm start` and opened http://localhost:3000 (not the .html file directly).");
  }

  let data;
  try{ data = await res.json(); }
  catch(e){ throw new Error("The server sent back an unreadable response."); }

  if(!res.ok){
    throw new Error(data && data.error ? data.error : ("Request failed (" + res.status + ")"));
  }
  if(!data.text){ throw new Error("No response received."); }
  return data.text;
}

function setLoading(btn, isLoading){ btn.disabled = isLoading; btn.classList.toggle('loading', isLoading); }
function showError(el, msg){ if(!el) return; el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }

// ---------- generic single image slot ----------
function wireImageSlot(prefix, onReady, onCleared){
  const dropZone = document.getElementById(prefix+'DropZone');
  const input = document.getElementById(prefix+'Input');
  const previewWrap = document.getElementById(prefix+'PreviewWrap');
  const preview = document.getElementById(prefix+'Preview');
  const swap = document.getElementById(prefix+'Swap');
  const errEl = document.getElementById(prefix+'Error');
  let data = null;

  dropZone.addEventListener('click', ()=> input.click());
  dropZone.addEventListener('dragover', e=>{ e.preventDefault(); dropZone.classList.add('drag'); });
  dropZone.addEventListener('dragleave', ()=> dropZone.classList.remove('drag'));
  dropZone.addEventListener('drop', e=>{ e.preventDefault(); dropZone.classList.remove('drag'); if(e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); });
  input.addEventListener('change', ()=>{ if(input.files[0]) handle(input.files[0]); });
  if(swap) swap.addEventListener('click', ()=>{
    data = null; previewWrap.style.display = 'none'; dropZone.style.display = ''; input.value='';
    if(onCleared) onCleared();
  });

  function handle(file){
    if(errEl) showError(errEl, '');
    if(!file.type.match(/image\/(png|jpeg|jpg|webp)/)){ if(errEl) showError(errEl, 'Please upload a PNG, JPG, or WEBP image.'); return; }
    if(file.size > 5 * 1024 * 1024){ if(errEl) showError(errEl, 'That image is larger than 5MB. Please use a smaller one.'); return; }
    const reader = new FileReader();
    reader.onload = ()=>{
      data = { base64: reader.result.split(',')[1], mediaType: file.type };
      preview.src = reader.result; dropZone.style.display = 'none'; previewWrap.style.display = 'block';
      if(onReady) onReady();
    };
    reader.onerror = ()=>{ if(errEl) showError(errEl, 'Could not read that file.'); };
    reader.readAsDataURL(file);
  }
  return { get: ()=>data };
}

document.addEventListener('DOMContentLoaded', ()=>{
  // char counters
  document.querySelectorAll('[data-count-target]').forEach(ta=>{
    const c = document.getElementById(ta.dataset.countTarget);
    if(!c) return;
    const update = ()=>{ c.textContent = ta.value.length + '/' + ta.getAttribute('maxlength'); };
    ta.addEventListener('input', update); update();
  });
  // copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn=>{
    const original = btn.innerHTML;
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.dataset.copy);
      if(!target) return;
      navigator.clipboard.writeText(target.textContent).then(()=>{
        btn.textContent = 'Copied';
        setTimeout(()=>{ btn.innerHTML = original; }, 1400);
      });
    });
  });
  // segmented controls
  document.querySelectorAll('.segmented').forEach(seg=>{
    const buttons = seg.querySelectorAll('button');
    buttons.forEach(b=>{
      b.addEventListener('click', ()=>{
        buttons.forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        seg.dataset.selected = b.dataset.val;
      });
    });
  });
});
