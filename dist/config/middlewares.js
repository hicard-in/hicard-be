module.exports = ({ env }) => [
    'strapi::errors',
    {
        name: "strapi::security",
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    "connect-src": ["'self'", "https:"],
                    "img-src": [
                        "'self'",
                        "data:",
                        "blob:",
                        env("CF_PUBLIC_ACCESS_URL").replace(/^https?:\/\//, ""),
                    ],
                    "media-src": [
                        "'self'",
                        "data:",
                        "blob:",
                        env("CF_PUBLIC_ACCESS_URL").replace(/^https?:\/\//, ""),
                    ],
                    upgradeInsecureRequests: null,
                },
            },
        },
    },
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
// export default [
//   'strapi::errors',
//   'strapi::security',
//   'strapi::cors',
//   'strapi::poweredBy',
//   'strapi::logger',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];
