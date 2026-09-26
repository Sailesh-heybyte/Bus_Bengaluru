export const alerts = [
  {
    id: "alt_01",
    type: "delay",
    route_id: "route_04",
    message: "Heavy rain on Mysuru highway causing 30 min delays.",
    message_kn: "ಮೈಸೂರು ಹೆದ್ದಾರಿಯಲ್ಲಿ ಭಾರೀ ಮಳೆಯಿಂದಾಗಿ 30 ನಿಮಿಷಗಳ ವಿಳಂಬ.",
    created_at: "2026-09-25T08:00:00Z",
    expires_at: "2026-09-25T23:59:59Z"
  },
  {
    id: "alt_02",
    type: "cancellation",
    route_id: "route_01",
    message: "Trip at 14:00 cancelled due to bus breakdown.",
    message_kn: "ಬಸ್ ಕೆಟ್ಟುಹೋದ ಕಾರಣ 14:00 ಗಂಟೆಯ ಪ್ರಯಾಣ ರದ್ದಾಗಿದೆ.",
    created_at: "2026-09-25T13:00:00Z",
    expires_at: "2026-09-25T18:00:00Z"
  }
];

export const stop_alerts = [];

export default {
  alerts,
  stop_alerts
};
