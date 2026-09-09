// Get the page elements
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggleBtn');
const eyeIcon = document.getElementById('eyeIcon');
const eyeOffIcon = document.getElementById('eyeOffIcon');
const copyInputBtn = document.getElementById('copyInputBtn');
const charCount = document.getElementById('charCount');

const strengthText = document.getElementById('strengthText');
const bar1 = document.getElementById('bar1');
const bar2 = document.getElementById('bar2');
const bar3 = document.getElementById('bar3');
const bar4 = document.getElementById('bar4');
const allBars = [bar1, bar2, bar3, bar4];

const scoreVal = document.getElementById('scoreVal');
const crackTime = document.getElementById('crackTime');
const checklistProgress = document.getElementById('checklistProgress');

const reqLength = document.getElementById('req-length');
const reqUpper = document.getElementById('req-upper');
const reqLower = document.getElementById('req-lower');
const reqNumber = document.getElementById('req-number');
const reqSymbol = document.getElementById('req-symbol');

const genBtn = document.getElementById('genBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthVal = document.getElementById('lengthVal');
const genOutput = document.getElementById('genOutput');
const copyGenBtn = document.getElementById('copyGenBtn');
const useBtn = document.getElementById('useBtn');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

toggleBtn.addEventListener('click', function () {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeIcon.classList.toggle('hidden', isPassword);
  eyeOffIcon.classList.toggle('hidden', !isPassword);
});

copyInputBtn.addEventListener('click', function () {
  const pwd = passwordInput.value;
  if (!pwd) {
    showToast('Please enter a password first');
    return;
  }
  navigator.clipboard.writeText(pwd).then(() => {
    showToast('Password copied to clipboard!');
  });
});

passwordInput.addEventListener('input', function () {
  const password = passwordInput.value;
  evaluatePassword(password);
});

function evaluatePassword(password) {
  const len = password.length;
  charCount.textContent = `${len} ${len === 1 ? 'character' : 'characters'}`;

  if (len === 0) {
    resetMeter();
    return;
  }

  const hasLength = len >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let passedCount = 0;
  if (updateItem(reqLength, hasLength)) passedCount++;
  if (updateItem(reqUpper, hasUpper)) passedCount++;
  if (updateItem(reqLower, hasLower)) passedCount++;
  if (updateItem(reqNumber, hasNumber)) passedCount++;
  if (updateItem(reqSymbol, hasSymbol)) passedCount++;

  checklistProgress.textContent = `${passedCount} / 5 Met`;

  let score = 0;
  if (len >= 8) score += 20;
  if (len >= 12) score += 20;
  if (hasUpper) score += 15;
  if (hasLower) score += 15;
  if (hasNumber) score += 15;
  if (hasSymbol) score += 15;

  score = Math.min(score, 100);
  scoreVal.textContent = score;

  allBars.forEach(b => {
    b.className = 'bg-slate-200 rounded-full transition-all duration-300';
  });

  if (passedCount <= 1) {
    setStrength('Weak', 'bg-rose-50 text-rose-700 border border-rose-200', 1, 'bg-rose-500');
  } else if (passedCount === 2) {
    setStrength('Moderate', 'bg-amber-50 text-amber-700 border border-amber-200', 2, 'bg-amber-500');
  } else if (passedCount === 3 || passedCount === 4) {
    setStrength('Strong', 'bg-emerald-50 text-emerald-700 border border-emerald-200', 3, 'bg-emerald-500');
  } else {
    setStrength('Very Strong', 'bg-cyan-50 text-cyan-700 border border-cyan-200', 4, 'bg-cyan-500');
  }

  crackTime.textContent = calculateCrackTime(password);
}

function setStrength(label, badgeClasses, activeBars, barColorClass) {
  strengthText.textContent = label;
  strengthText.className = `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClasses}`;

  for (let i = 0; i < activeBars; i++) {
    allBars[i].className = `${barColorClass} rounded-full transition-all duration-300 shadow-sm`;
  }
}

function updateItem(element, isValid) {
  const icon = element.querySelector('span');
  if (isValid) {
    icon.textContent = '✓';
    icon.className = 'w-4 text-center font-bold text-emerald-600';
    element.className = 'flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 text-slate-800 transition-all duration-150';
    return true;
  } else {
    icon.textContent = '✕';
    icon.className = 'w-4 text-center font-bold text-red-500';
    element.className = 'flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-pink-300 text-slate-700 transition-all duration-150';
    return false;
  }
}

function resetMeter() {
  strengthText.textContent = 'Awaiting Input';
  strengthText.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200';
  scoreVal.textContent = '0';
  crackTime.textContent = 'Instant';
  checklistProgress.textContent = '0 / 5 Met';

  allBars.forEach(b => {
    b.className = 'bg-slate-200 rounded-full transition-all duration-300';
  });

  const allItems = [reqLength, reqUpper, reqLower, reqNumber, reqSymbol];
  allItems.forEach(item => updateItem(item, false));
}

function calculateCrackTime(password) {
  if (password.length < 5) return 'Instant';

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) return 'Instant';

  const combinations = Math.pow(poolSize, password.length);
  const seconds = combinations / (2 * 10000000000); // 10 Billion guesses/sec

  if (seconds < 1) return '< 1 sec';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  return 'Centuries+';
}

genBtn.addEventListener('click', generatePassword);

lengthSlider.addEventListener('input', function () {
  lengthVal.textContent = lengthSlider.value;
});
lengthSlider.addEventListener('change', generatePassword);

function generatePassword() {
  const length = parseInt(lengthSlider.value, 10) || 16;
  lengthVal.textContent = length;

  const pools = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    '!@#$%^&*()_+'
  ];
  const allChars = pools.join('');

  const randomChar = (set) => set[Math.floor(Math.random() * set.length)];

  let result = pools.map(randomChar);
  for (let i = result.length; i < length; i++) {
    result.push(randomChar(allChars));
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  genOutput.value = result.join('');
}

copyGenBtn.addEventListener('click', function () {
  if (!genOutput.value) return;
  navigator.clipboard.writeText(genOutput.value).then(() => {
    showToast('Generated password copied!');
  });
});

useBtn.addEventListener('click', function () {
  if (!genOutput.value) return;
  passwordInput.value = genOutput.value;
  evaluatePassword(genOutput.value);
  showToast('Applied to tester input!');
  passwordInput.focus();
});

function showToast(message) {
  toastMsg.textContent = message;
  toast.classList.remove('opacity-0', 'pointer-events-none');
  toast.classList.add('opacity-100');
  setTimeout(function () {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0', 'pointer-events-none');
  }, 2200);
}

generatePassword();
resetMeter();
