const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));

document.querySelectorAll('[data-personal-data-form]').forEach(form=>{
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const consent=form.querySelector('input[name="personal_data_consent"]');
    if(!consent?.checked){
      consent?.setCustomValidity('Для отправки заявки необходимо дать согласие на обработку персональных данных.');
      consent?.reportValidity();
      return;
    }
    consent.setCustomValidity('');
    const note=form.querySelector('.form-note');
    if(note) note.textContent='Форма прошла проверку согласия. Для реальной отправки подключим защищённый обработчик заявок.';
  });
  const consent=form.querySelector('input[name="personal_data_consent"]');
  consent?.addEventListener('change',()=>consent.setCustomValidity(''));
});