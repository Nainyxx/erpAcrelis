// Конфигурация API
const API_CONFIG = {
  BASE_URL: 'https://api.acrelis.ru/',
  CSRF_TOKEN: 'ZvWfFB1bOKo6BawwGWwPwt2GBx1kBzoO'
};

// Ключи для localStorage
const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token'
};

// Простой сервис авторизации
class SimpleAuthService {
  // Установить токены (используйте ваши полученные токены)
  static setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
    console.log('✅ Токены сохранены в localStorage');
  }

  // Получить access token
  static getAccessToken() {
    return localStorage.getItem(TOKEN_KEYS.ACCESS);
  }

  // Получить refresh token
  static getRefreshToken() {
    return localStorage.getItem(TOKEN_KEYS.REFRESH);
  }

  // Проверить, есть ли токены
  static hasTokens() {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  // Очистить токены
  static clearTokens() {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  }

  // Получить заголовки для запросов
  static getAuthHeaders() {
    const accessToken = this.getAccessToken();
    
    return {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN,
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  }
}

// Инициализация с вашими токенами
SimpleAuthService.setTokens(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2NDg1NjM1LCJpYXQiOjE3NjYzOTkyMzUsImp0aSI6IjJmMTM1ZTUwNDA2MjQ5NDU5MGIzMGE5MjI3ODU3MDIyIiwidXNlcl9pZCI6IjMifQ.CeUrAuhiIW7uvRrOCxb3xzzVcvlL3bZb8YtowrRqr6g",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2NzAwNDAzNSwiaWF0IjoxNzY2Mzk5MjM1LCJqdGkiOiIwZTI5N2EyNTZiMGE0NDdkYjZhNjRlNmU1MDMwYWY2ZCIsInVzZXJfaWQiOiIzIn0.XJW7YX0kopsYl19SZgpysj1tefePeaFm0FvpoSQyxHE"
);

export default SimpleAuthService;