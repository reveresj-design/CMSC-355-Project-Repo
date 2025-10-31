// FileName: reportWebVitals.js
// Description: Measures and reports Core Web Vitals performance metrics 

// Reports web vitals.
const reportWebVitals = onPerfEntry => {
  // Checks if onPerfEntry is a function.
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Imports web-vitals library.
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Calls web-vitals functions.
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Exporting.
export default reportWebVitals;
