class LocalStorage {
    static setItem(key, value) {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
      } catch (error) {
        console.error("LocalStorage setItem error:", error);
      }
    }
  
    static getItem(key) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error("LocalStorage getItem error:", error);
        return null;
      }
    }
  
    static removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("LocalStorage removeItem error:", error);
      }
    }
  
    static clear() {
      try {
        localStorage.clear();
      } catch (error) {
        console.error("LocalStorage clear error:", error);
      }
    }
  }
  
  export default LocalStorage;
  