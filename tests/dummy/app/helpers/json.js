export default function json(status, payload) {
  return function() {
    return [
      status,
      { 'Content-Type' : 'text/json' },
      JSON.stringify(payload)
    ];
  };
}
