import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import intro1 from '../../assets/intro/1.png';
import intro2 from '../../assets/intro/2.png';
import intro3 from '../../assets/intro/3.png';
import welcomeAvatar from '../../assets/welcome_avatar.png';
import signupAvatar from '../../assets/signup_avatar.png';
import './index.scss';

export function Onboarding() {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useAuth();

  const [introStep, setIntroStep] = useState(0); // 0, 1, 2: Intro Carousel, 3: Language Selection, >=4: Auth
  const [authMode, setAuthMode] = useState('welcome'); // 'welcome' | 'login' | 'signup' | 'otp'
  const [otpSource, setOtpSource] = useState('login'); // 'login' | 'signup'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');

  const introSlides = [
    {
      image: intro1,
      desc: t('intro_1_desc')
    },
    {
      image: intro2,
      desc: t('intro_2_desc')
    },
    {
      image: intro3,
      desc: t('intro_3_desc')
    }
  ];

  const renderIntroTitle = (stepIdx) => {
    switch (stepIdx) {
      case 0:
        return language === 'kn' ? (
          <h2 className="onboarding-intro__title">
            <span className="onboarding-intro__highlight">YATRE</span> ಗೆ ಸುಸ್ವಾಗತ!
          </h2>
        ) : (
          <h2 className="onboarding-intro__title">
            Welcome to <span className="onboarding-intro__highlight">YATRE!</span>
          </h2>
        );
      case 1:
        return language === 'kn' ? (
          <h2 className="onboarding-intro__title">
            ತ್ವರಿತ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ <span className="onboarding-intro__highlight">ಬಸ್ ಟ್ರ್ಯಾಕಿಂಗ್</span>
          </h2>
        ) : (
          <h2 className="onboarding-intro__title">
            Quick and Reliable <span className="onboarding-intro__highlight">Bus Tracking</span>
          </h2>
        );
      case 2:
        return language === 'kn' ? (
          <h2 className="onboarding-intro__title">
            ಸುಲಭವಾದ <span className="onboarding-intro__highlight">ಮಾರ್ಗ ಟ್ರ್ಯಾಕಿಂಗ್</span>
          </h2>
        ) : (
          <h2 className="onboarding-intro__title">
            Effortless <span className="onboarding-intro__highlight">Route Tracking</span>
          </h2>
        );
      default:
        return null;
    }
  };

  // Timer for OTP resend countdown
  useEffect(() => {
    let interval = null;
    if (authMode === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authMode, timer]);

  const handleSendOtp = (source) => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('phone_placeholder') || 'Enter a valid 10-digit number');
      return;
    }
    if (source === 'signup' && !fullName.trim()) {
      setError(t('full_name_placeholder') || 'Enter your full name');
      return;
    }
    setError('');
    setOtpSource(source);
    setOtpDigits(['', '', '', '', '', '']);
    setTimer(30);
    setAuthMode('otp');
  };

  const handleVerifyOtp = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setError(t('enter_otp') || 'Please enter the 6-digit code');
      return;
    }
    if (enteredOtp === '123456') {
      setError('');
      login(cleanPhone);
    } else {
      setError(t('invalid_otp') || 'Invalid OTP. Use 123456.');
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    // If all 6 digits entered, auto-verify
    if (digit && newDigits.join('').length === 6) {
      if (newDigits.join('') === '123456') {
        const cleanPhone = phone.trim().replace(/\D/g, '');
        login(cleanPhone);
        return;
      }
    }

    // Auto-advance to next box
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    if (pastedData.length === 6) {
      if (pastedData === '123456') {
        const cleanPhone = phone.trim().replace(/\D/g, '');
        login(cleanPhone);
      } else {
        setError(t('invalid_otp') || 'Invalid OTP. Use 123456.');
      }
    }
  };

  const fillDemoOtp = () => {
    const demoDigits = ['1', '2', '3', '4', '5', '6'];
    setOtpDigits(demoDigits);
    setError('');
    const cleanPhone = phone.trim().replace(/\D/g, '');
    login(cleanPhone);
  };

  const handleResendOtp = () => {
    setTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    const firstInput = document.getElementById('otp-box-0');
    if (firstInput) firstInput.focus();
  };

  // Carousel view before Language Selection
  if (introStep < 3) {
    const currentSlide = introSlides[introStep];
    return (
      <div
        className="onboarding-intro"
        onClick={() => setIntroStep((prev) => prev + 1)}
        role="button"
        tabIndex={0}
        aria-label="Next slide"
      >
        <div className="onboarding-intro__content">
          <div className="onboarding-intro__image-wrap">
            <img
              src={currentSlide.image}
              alt=""
              className="onboarding-intro__image"
            />
          </div>

          <div className="onboarding-intro__text-wrap">
            {renderIntroTitle(introStep)}
            <p className="onboarding-intro__desc">{currentSlide.desc}</p>
          </div>
        </div>

        <div className="onboarding-intro__footer">
          <div className="onboarding-intro__dots" aria-hidden="true">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className={`onboarding-intro__dot ${idx === introStep ? 'onboarding-intro__dot--active' : ''}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="onboarding-intro__skip-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIntroStep(3);
            }}
          >
            {t('skip')}
          </button>
        </div>
      </div>
    );
  }

  // Dedicated Language Selection Screen
  if (introStep === 3) {
    const languageOptions = [
      { id: 'en', label: t('lang_en'), glyph: 'A', badgeClass: 'onboarding-lang-card__badge--en' },
      { id: 'kn', label: t('lang_kn'), glyph: 'ಅ', badgeClass: 'onboarding-lang-card__badge--kn' },
      { id: 'hi', label: t('lang_hi'), glyph: 'अ', badgeClass: 'onboarding-lang-card__badge--hi' }
    ];

    return (
      <div className="onboarding-lang-screen">
        <div className="onboarding-lang-screen__top-wrapper">
          {/* Header */}
          <div className="onboarding-lang-screen__header">
            <h1 className="onboarding-lang-screen__title">{t('choose_language')}</h1>
            <p className="onboarding-lang-screen__sub">{t('select_language_sub')}</p>
          </div>

          {/* 3 Option Cards with leading native script badge and single native label */}
          <div className="onboarding-lang-cards" role="radiogroup" aria-label={t('choose_language')}>
            {languageOptions.map((opt) => {
              const isSelected = language === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`onboarding-lang-card ${isSelected ? 'onboarding-lang-card--selected' : ''}`}
                  onClick={() => setLanguage(opt.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setLanguage(opt.id);
                    }
                  }}
                >
                  <div className="onboarding-lang-card__left">
                    <span className={`onboarding-lang-card__badge ${opt.badgeClass}`} aria-hidden="true">
                      {opt.glyph}
                    </span>
                    <span className="onboarding-lang-card__label">{opt.label}</span>
                  </div>

                  <div className="onboarding-lang-card__right">
                    <div className="onboarding-lang-card__indicator">
                      {isSelected ? (
                        <i className="bi bi-check-circle-fill" aria-hidden="true" />
                      ) : (
                        <span className="onboarding-lang-card__circle" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Blue Continue Button */}
        <div className="onboarding-lang-screen__footer">
          <button
            type="button"
            className="onboarding-lang-screen__continue-btn"
            onClick={() => {
              setLanguage(language);
              setIntroStep(4);
            }}
          >
            {t('continue')}
          </button>
        </div>
      </div>
    );
  }

  // Authentication Screens (introStep >= 4)
  return (
    <div className="onboarding-auth-page">
      {/* View: Welcome Screen */}
      {authMode === 'welcome' && (
        <div className="onboarding-auth-view onboarding-auth-view--welcome">
          <div className="onboarding-auth-view__top">
            <span className="onboarding-auth-view__brand-tag">YATRE</span>
            <button
              type="button"
              className="onboarding-auth-view__lang-toggle"
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              aria-label={t('switch_language')}
            >
              <i className="bi bi-translate" aria-hidden="true" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
          </div>

          <div className="onboarding-welcome__center">
            {/* Thumbs-up illustration asset from 6.png */}
            <div className="onboarding-welcome__avatar-wrap">
              <img
                src={welcomeAvatar}
                alt="Welcome to YATRE"
                className="onboarding-welcome__avatar-img"
              />
            </div>

            <h1 className="onboarding-welcome__title">{t('welcome_app')}</h1>
            <p className="onboarding-welcome__desc">{t('welcome_sub')}</p>
          </div>

          <div className="onboarding-auth-view__bottom">
            <button
              type="button"
              className="onboarding-auth-view__primary-btn"
              onClick={() => {
                setError('');
                setAuthMode('login');
              }}
            >
              <span>{t('get_started')}</span>
            </button>

            <div className="onboarding-auth-view__footer">
              <p className="onboarding-auth-view__footer-text">
                {t('already_have_account')}{' '}
                <button
                  type="button"
                  className="onboarding-auth-view__footer-link"
                  onClick={() => {
                    setError('');
                    setAuthMode('login');
                  }}
                >
                  {t('sign_in')}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View: Login Screen */}
      {authMode === 'login' && (
        <div className="onboarding-auth-view onboarding-auth-view--login">
          <div className="onboarding-auth-view__top">
            <button
              type="button"
              className="onboarding-auth-view__back-btn"
              onClick={() => {
                setError('');
                setAuthMode('welcome');
              }}
              aria-label="Back"
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="onboarding-auth-view__lang-toggle"
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              aria-label={t('switch_language')}
            >
              <i className="bi bi-translate" aria-hidden="true" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
          </div>

          <div className="onboarding-auth-view__center">
            {/* Bus logo matching Image 1 */}
            <div className="onboarding-auth__logo-icon">
              <i className="bi bi-bus-front-fill" aria-hidden="true" />
            </div>
            <h1 className="onboarding-auth__brand">YATRE</h1>
            <h2 className="onboarding-auth__title">{t('login_account')}</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp('login');
              }}
              className="onboarding-auth__form"
            >
              <div className="onboarding-field">
                <label className="onboarding-field__label" htmlFor="login-phone">
                  {t('phone_number')}
                </label>
                <div className="onboarding-field__input-box">
                  <span className="onboarding-field__prefix">+91</span>
                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className="onboarding-field__input"
                    placeholder={t('phone_placeholder')}
                    value={phone}
                    onChange={(e) => {
                      setError('');
                      setPhone(e.target.value.replace(/\D/g, ''));
                    }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="onboarding-auth__error" role="alert">
                  <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                className="onboarding-auth-view__primary-btn"
                disabled={phone.length !== 10}
              >
                {t('get_otp')}
              </button>
            </form>
          </div>

          <div className="onboarding-auth-view__bottom">
            <div className="onboarding-auth-view__footer">
              <p className="onboarding-auth-view__footer-text">
                {t('dont_have_account')}{' '}
                <button
                  type="button"
                  className="onboarding-auth-view__footer-link"
                  onClick={() => {
                    setError('');
                    setAuthMode('signup');
                  }}
                >
                  {t('sign_up')}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View: Create Account (Signup) Screen */}
      {authMode === 'signup' && (
        <div className="onboarding-auth-view onboarding-auth-view--signup">
          <div className="onboarding-auth-view__top">
            <button
              type="button"
              className="onboarding-auth-view__back-btn"
              onClick={() => {
                setError('');
                setAuthMode('login');
              }}
              aria-label="Back"
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="onboarding-auth-view__lang-toggle"
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              aria-label={t('switch_language')}
            >
              <i className="bi bi-translate" aria-hidden="true" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
          </div>

          <div className="onboarding-auth-view__center">
            {/* Avatar asset with plus badge from 7.png */}
            <div className="onboarding-signup__avatar-wrap">
              <img
                src={signupAvatar}
                alt="Create account"
                className="onboarding-signup__avatar-img"
              />
            </div>

            <h1 className="onboarding-auth__brand onboarding-auth__brand--signup">
              {t('create_account')}
            </h1>
            <p className="onboarding-auth__sub">{t('create_account_sub')}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp('signup');
              }}
              className="onboarding-auth__form"
            >
              <div className="onboarding-field">
                <label className="onboarding-field__label" htmlFor="signup-name">
                  {t('full_name')}
                </label>
                <div className="onboarding-field__input-box">
                  <input
                    id="signup-name"
                    type="text"
                    className="onboarding-field__input onboarding-field__input--standalone"
                    placeholder={t('full_name_placeholder')}
                    value={fullName}
                    onChange={(e) => {
                      setError('');
                      setFullName(e.target.value);
                    }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="onboarding-field">
                <label className="onboarding-field__label" htmlFor="signup-phone">
                  {t('phone_number')}
                </label>
                <div className="onboarding-field__input-box">
                  <span className="onboarding-field__prefix">+91</span>
                  <input
                    id="signup-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className="onboarding-field__input"
                    placeholder={t('phone_placeholder')}
                    value={phone}
                    onChange={(e) => {
                      setError('');
                      setPhone(e.target.value.replace(/\D/g, ''));
                    }}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="onboarding-auth__error" role="alert">
                  <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                className="onboarding-auth-view__primary-btn"
                disabled={!fullName.trim() || phone.length !== 10}
              >
                {t('get_otp')}
              </button>
            </form>
          </div>

          <div className="onboarding-auth-view__bottom">
            <div className="onboarding-auth-view__footer">
              <p className="onboarding-auth-view__footer-text">
                {t('already_have_account')}{' '}
                <button
                  type="button"
                  className="onboarding-auth-view__footer-link"
                  onClick={() => {
                    setError('');
                    setAuthMode('login');
                  }}
                >
                  {t('sign_in')}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View: OTP Verification Screen */}
      {authMode === 'otp' && (
        <div className="onboarding-auth-view onboarding-auth-view--otp">
          <div className="onboarding-auth-view__top">
            <button
              type="button"
              className="onboarding-auth-view__back-btn"
              onClick={() => {
                setError('');
                setAuthMode(otpSource);
              }}
              aria-label="Back"
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="onboarding-auth-view__lang-toggle"
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              aria-label={t('switch_language')}
            >
              <i className="bi bi-translate" aria-hidden="true" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
          </div>

          <div className="onboarding-auth-view__center">
            <div className="onboarding-otp__icon-wrap">
              <i className="bi bi-shield-lock-fill" aria-hidden="true" />
            </div>

            <h1 className="onboarding-auth__brand">{t('enter_otp')}</h1>
            <p className="onboarding-otp__desc">
              {t('otp_sent_to')} <strong>+91 {phone}</strong>{' '}
              <button
                type="button"
                className="onboarding-otp__edit-btn"
                onClick={() => {
                  setError('');
                  setAuthMode(otpSource);
                }}
              >
                ({t('change_number')})
              </button>
            </p>

            <form onSubmit={handleVerifyOtp} className="onboarding-auth__form">
              {/* 6-box OTP Input */}
              <div className="onboarding-otp__boxes" role="group" aria-label={t('enter_otp')}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className={`onboarding-otp__box ${digit ? 'onboarding-otp__box--filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Demo Hint Banner with 1-tap fill */}
              <div
                className="onboarding-otp__demo-banner"
                onClick={fillDemoOtp}
                role="button"
                tabIndex={0}
              >
                <i className="bi bi-key-fill" aria-hidden="true" />
                <span>{t('demo_otp_hint')}</span>
                <span className="onboarding-otp__auto-fill">Tap to fill</span>
              </div>

              {error && (
                <p className="onboarding-auth__error" role="alert">
                  <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                className="onboarding-auth-view__primary-btn"
                disabled={otpDigits.join('').length !== 6}
              >
                {otpSource === 'signup' ? t('verify_create_account') : t('verify_otp')}
              </button>
            </form>

            {/* Resend OTP Timer */}
            <div className="onboarding-otp__resend-wrap">
              {timer > 0 ? (
                <span className="onboarding-otp__timer-text">
                  {t('resend_otp_in')} <strong>{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="onboarding-otp__resend-btn"
                  onClick={handleResendOtp}
                >
                  <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                  <span>{t('resend_otp')}</span>
                </button>
              )}
            </div>
          </div>

          <div className="onboarding-auth-view__bottom">
            <div className="onboarding-auth-view__footer">
              <p className="onboarding-auth-view__footer-text">
                {otpSource === 'login' ? (
                  <>
                    {t('dont_have_account')}{' '}
                    <button
                      type="button"
                      className="onboarding-auth-view__footer-link"
                      onClick={() => {
                        setError('');
                        setAuthMode('signup');
                      }}
                    >
                      {t('sign_up')}
                    </button>
                  </>
                ) : (
                  <>
                    {t('already_have_account')}{' '}
                    <button
                      type="button"
                      className="onboarding-auth-view__footer-link"
                      onClick={() => {
                        setError('');
                        setAuthMode('login');
                      }}
                    >
                      {t('sign_in')}
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Onboarding;
