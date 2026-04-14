// EduBD - Newsletter & Subscription Handler

document.addEventListener('DOMContentLoaded', function() {
  initNewsletter();
  initSocialButtons();
});

function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form-el');

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleNewsletterSubmit(this);
    });
  });

  // Also handle submit buttons that aren't in a form
  document.querySelectorAll('[data-newsletter-submit]').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.closest('.sidebar-card, .newsletter-form')
        ?.querySelector('input[type="email"]');
      if (input) {
        handleNewsletterSubmitByEmail(input.value.trim(), input);
      }
    });
  });
}

function handleNewsletterSubmit(form) {
  const emailInput = form.querySelector('input[type="email"]');
  if (!emailInput) return;
  handleNewsletterSubmitByEmail(emailInput.value.trim(), emailInput);
}

function handleNewsletterSubmitByEmail(email, inputEl) {
  if (!email) {
    showToast('ইমেইল ঠিকানা দিন।', 'warning');
    if (inputEl) inputEl.focus();
    return;
  }

  if (!isValidEmail(email)) {
    showToast('সঠিক ইমেইল ঠিকানা দিন।', 'error');
    if (inputEl) inputEl.focus();
    return;
  }

  // Check localStorage for duplicates
  const subscribers = getSubscribers();
  if (subscribers.includes(email)) {
    showToast('এই ইমেইলটি আগেই সাবস্ক্রাইব করা হয়েছে।', 'info');
    return;
  }

  // Save
  subscribers.push(email);
  saveSubscribers(subscribers);

  if (inputEl) inputEl.value = '';
  showToast('সফলভাবে সাবস্ক্রাইব করা হয়েছে! ধন্যবাদ। 🎉', 'success');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSubscribers() {
  try {
    return JSON.parse(localStorage.getItem('edubd_subscribers') || '[]');
  } catch {
    return [];
  }
}

function saveSubscribers(subscribers) {
  try {
    localStorage.setItem('edubd_subscribers', JSON.stringify(subscribers));
  } catch (e) {
    // localStorage not available (e.g. private mode)
  }
}

// ===================== SOCIAL BUTTONS =====================
function initSocialButtons() {
  const whatsappBtns = document.querySelectorAll('[data-whatsapp]');
  const telegramBtns = document.querySelectorAll('[data-telegram]');

  whatsappBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const message = encodeURIComponent('আমি EduBD থেকে শিক্ষা সংক্রান্ত আপডেট পেতে চাই।');
      window.open(`https://wa.me/8801700000000?text=${message}`, '_blank', 'noopener');
    });
  });

  telegramBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      window.open('https://t.me/edubd_portal', '_blank', 'noopener');
    });
  });
}

// ===================== STANDALONE SUBSCRIBE BUTTON =====================
function subscribeNewsletter(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  handleNewsletterSubmitByEmail(input.value.trim(), input);
}

window.subscribeNewsletter = subscribeNewsletter;
