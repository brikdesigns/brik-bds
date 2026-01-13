/**
 * =============================================
 *        ENHANCED CMS CONTENT INJECTION SYSTEM
 * =============================================
 * Properly integrated with Webflow's industry
 * filtering system. Populates content AND sets
 * proper data-industry attributes.
 * =============================================
 */

// CMS Data
const cmsData = {
  "dental": {
    "slug": "dental",
    "name": "Dental",
    "home": {
      "hero": {
        "title": "Your Smile is Our Priority – Gentle, Expert Dental Care You Can Trust",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "location1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e4a3b83bb1794cbaa74_img_lg_2x.webp",
        "location2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e4a3b83bb1794cbaa74_img_lg_2x.webp",
        "location3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f04d26602a96b979e9578_frame_8_2x.webp",
        "person1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e5bb76f5b253dc1fc31_image-wrapper.jpg",
        "person2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f04d26602a96b979e9578_frame_8_2x.webp",
        "person3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e53a3554dd4189506b0_image_wrapper_2x.webp"
      },
      "cta": {
        "title": "Get started with dental services today",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      }
    },
    "about": {
      "title": "Our Team of Experts",
      "description": "Our diverse team brings together a wealth of experience and expertise. Each member plays a crucial role in driving our success and delivering exceptional results for our clients.",
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e4a3b83bb1794cbaa74_img_lg_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e3c831b9c9befb709af_img-lg.jpg",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2c90bb1ce869f5959a0d_Frame%208.jpg",
        "image4": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e53a3554dd4189506b0_image_wrapper_2x.webp",
        "image5": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e5bb76f5b253dc1fc31_image-wrapper.jpg"
      },
      "topics": [
        {
          "title": "Topic 1 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 2 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 3 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 4 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        }
      ]
    },
    "services": {
      "hero": {
        "title": "What We Do",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f04d26602a96b979e9578_frame_8_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e53a3554dd4189506b0_image_wrapper_2x.webp",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684c2e4a3b83bb1794cbaa74_img_lg_2x.webp"
      },
      "serviceList": [
        {
          "title": "Crowns",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Braces",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Cleaning Exam",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Invisalign",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        }
      ]
    },
    "contact": {},
    "audience": {}
  },
  "finance": {
    "slug": "finance",
    "name": "Finance",
    "home": {
      "hero": {
        "title": "Your Tech is Our Priority - Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "location1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed911ae65f3dbd1418fa_img_lg_location_1_2x.webp",
        "location2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed97f1fe4d7f7a3ef76f_img_lg_location_2_2x.webp",
        "location3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed9dadea4a1054e15053_img_lg_employee_4_2x.webp",
        "person1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852eda2438bece3a8ab778a_img_lg_employee_3_2x.webp",
        "person2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852eda6d33aae46fd1dfb2d_img_lg_employee_2_2x.webp",
        "person3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852edb69b241f407eea8412_img_lg_employee_1_2x.webp"
      },
      "cta": {
        "title": "Get started with finance services today",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      }
    },
    "about": {
      "title": "Welcome to Our Company",
      "description": "We are dedicated to providing the best services in the industry. Our team is composed of experienced professionals who are passionate about their work and committed to excellence.",
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed9dadea4a1054e15053_img_lg_employee_4_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/683f32029511918153ed5eec_image2.jpeg",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852eda2438bece3a8ab778a_img_lg_employee_3_2x.webp",
        "image4": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852eda6d33aae46fd1dfb2d_img_lg_employee_2_2x.webp",
        "image5": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed97f1fe4d7f7a3ef76f_img_lg_location_2_2x.webp"
      },
      "topics": [
        {
          "title": "Topic 1 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 2 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 3 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 4 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        }
      ]
    },
    "services": {
      "hero": {
        "title": "What We Do",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852eda2438bece3a8ab778a_img_lg_employee_3_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852eda6d33aae46fd1dfb2d_img_lg_employee_2_2x.webp",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed97f1fe4d7f7a3ef76f_img_lg_location_2_2x.webp"
      },
      "serviceList": [
        {
          "title": "Service 1 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 2 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 3 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 4 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        }
      ]
    },
    "contact": {},
    "audience": {}
  },
  "real-estate": {
    "slug": "real-estate",
    "name": "Real Estate",
    "home": {
      "hero": {
        "title": "Your Property is Our Priority - Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "location1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f1b9b25e45d423c85b7de_img_lg_location_2_2x.webp",
        "location2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f1b9b25e45d423c85b7de_img_lg_location_2_2x.webp",
        "location3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ecefb8c7d44eaf819f85_img_lg_vehicle_1_2x.webp",
        "person1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f2378133f5c2c8afd653d_img_lg_staff_1_2x.webp",
        "person2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f23808f9f0aa60e8cb41c_img_lg_patient_2_2x.webp",
        "person3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ecfa5745296ac4c4ac58_img_lg_patient_3_2x.webp"
      },
      "cta": {
        "title": "Get started with real-estate services today",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      }
    },
    "about": {
      "title": "A Brief History",
      "description": "Founded in 2010, our company has grown from a small startup to a leading player in the market. Our journey has been marked by significant milestones and achievements that reflect our commitment to growth and excellence.",
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ecefb8c7d44eaf819f85_img_lg_vehicle_1_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f23808f9f0aa60e8cb41c_img_lg_patient_2_2x.webp",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f2378133f5c2c8afd653d_img_lg_staff_1_2x.webp",
        "image4": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ecfa5745296ac4c4ac58_img_lg_patient_3_2x.webp",
        "image5": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f1b9b25e45d423c85b7de_img_lg_location_2_2x.webp"
      },
      "topics": [
        {
          "title": "Topic 1 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 2 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 3 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 4 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        }
      ]
    },
    "services": {
      "hero": {
        "title": "What We Do",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ecfa5745296ac4c4ac58_img_lg_patient_3_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f2378133f5c2c8afd653d_img_lg_staff_1_2x.webp",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/684f1b9b25e45d423c85b7de_img_lg_location_2_2x.webp"
      },
      "serviceList": [
        {
          "title": "Service 1 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 2 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 3 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 4 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        }
      ]
    },
    "contact": {},
    "audience": {}
  },
  "small-business": {
    "slug": "small-business",
    "name": "Small Business",
    "home": {
      "hero": {
        "title": "Your Business is Our Priority - Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "location1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed5b339c8b012f350d33_img_lg_location_1_2x.webp",
        "location2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed6085f6893a9dab0a3b_img_lg_location_2_2x.webp",
        "location3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed65acbd8ec11521c47d_img_lg_customer_4_2x.webp",
        "person1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed8124dfc2f07b3663ef_img_lg_customer_2_2x.webp",
        "person2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed75b7d5705798856b0d_img_lg_employee_2_2x.webp",
        "person3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed7b6aef670f608dc591_img_lg_employee_1_2x.webp"
      },
      "cta": {
        "title": "Get started with small-business services today",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      }
    },
    "about": {
      "title": "Our Mission and Vision",
      "description": "Our mission is to innovate and lead in our field, ensuring customer satisfaction through quality and reliability. We envision a future where our solutions empower individuals and businesses alike.",
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed75b7d5705798856b0d_img_lg_employee_2_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed8124dfc2f07b3663ef_img_lg_customer_2_2x.webp",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed7b6aef670f608dc591_img_lg_employee_1_2x.webp",
        "image4": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed65acbd8ec11521c47d_img_lg_customer_4_2x.webp",
        "image5": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed65acbd8ec11521c47d_img_lg_customer_4_2x.webp"
      },
      "topics": [
        {
          "title": "Topic 1 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 2 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 3 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        },
        {
          "title": "Topic 4 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere."
        }
      ]
    },
    "services": {
      "hero": {
        "title": "What We Do",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
      },
      "images": {
        "image1": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed8124dfc2f07b3663ef_img_lg_customer_2_2x.webp",
        "image2": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed65acbd8ec11521c47d_img_lg_customer_4_2x.webp",
        "image3": "https://cdn.prod.website-files.com/67c4e62250923072710d478a/6852ed6085f6893a9dab0a3b_img_lg_location_2_2x.webp"
      },
      "serviceList": [
        {
          "title": "Service 1 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 2 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 3 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        },
        {
          "title": "Service 4 Title",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        }
      ]
    },
    "contact": {},
    "audience": {}
  }
};

// Enhanced content mappings that work with Webflow's structure
const contentMappings = {
  // Hero section mappings
  hero: {
    title: [
      '.section_hero h1.text_display-xl.inverse',
      '.collection-hero-item h1.text_display-xl',
      '.hero_interior h1.text_display-xl',
      '.section_hero .text_display-xl',
      '[data-industry] h1.text_display-xl',
      '.w-dyn-item h1.text_display-xl'
    ],
    description: [
      '.section_hero p.text_body-xxl.inverse',
      '.collection-hero-item p.text_body-xxl',
      '.hero_interior p.text_body-xxl',
      '.section_hero .text_body-xxl',
      '[data-industry] p.text_body-xxl',
      '.w-dyn-item p.text_body-xxl'
    ]
  },

  // About section mappings
  about: {
    title: [
      '.section_about h2.text_display-md',
      '.about_content h2',
      '.w-dyn-item h2.text_display-md',
      '[data-industry] h2.text_display-md'
    ],
    description: [
      '.section_about p.text_body-xl',
      '.about_content p',
      '.w-dyn-item p.text_body-xl',
      '[data-industry] p.text_body-xl'
    ]
  },

  // Services section mappings
  services: {
    title: [
      '.section_services h2.text_display-md',
      '.services_content h2',
      '.w-dyn-item h2.text_display-md',
      '[data-industry] h2.text_display-md'
    ],
    description: [
      '.section_services p.text_body-xl',
      '.services_content p',
      '.w-dyn-item p.text_body-xl',
      '[data-industry] p.text_body-xl'
    ]
  },

  // CTA section mappings
  cta: {
    title: [
      '.section_cta h2.text_display-md.inverse',
      '.cta_content h2',
      '.w-dyn-item h2.text_display-md',
      '[data-industry] h2.text_display-md'
    ],
    description: [
      '.section_cta p.text_body-xl.inverse',
      '.cta_content p',
      '.w-dyn-item p.text_body-xl',
      '[data-industry] p.text_body-xl'
    ]
  },

  // Image mappings
  images: {
    hero: [
      '.section_hero img',
      '.hero_image img',
      '.collection-hero-item img',
      '[data-industry] img'
    ],
    content: [
      '.section_about img',
      '.section_services img',
      '.content_image img',
      '[data-industry] img'
    ]
  }
};

class EnhancedCMSSystem {
  constructor() {
    this.currentIndustry = 'dental';
    this.isInitialized = false;
    this.initializeSystem();
  }

  initializeSystem() {
    console.log('🚀 Enhanced CMS System initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Listen for industry changes from the filtering system
    document.addEventListener('industryChanged', (event) => {
      console.log('📢 Industry changed event received:', event.detail.industry);
      this.updateContent(event.detail.industry);
    });

    // Get initial industry from localStorage or URL
    this.currentIndustry = this.getInitialIndustry();
    
    // Restore saved filter class if available
    this.restoreSavedFilterClass();
    
    // Populate initial content BEFORE the filtering system runs
    setTimeout(() => {
      this.populateInitialContent();
      this.isInitialized = true;
      console.log('✅ Enhanced CMS System ready!');
    }, 100); // Small delay to ensure DOM is ready
  }

  restoreSavedFilterClass() {
    try {
      const savedFilterClass = localStorage.getItem('brik-industry-filter');
      if (savedFilterClass && savedFilterClass.startsWith('filter-')) {
        document.body.classList.add(savedFilterClass);
        console.log(`🔄 Restored saved filter class: ${savedFilterClass}`);
      } else {
        // Set default filter class based on current industry
        const defaultFilterClass = `filter-${this.currentIndustry}`;
        document.body.classList.add(defaultFilterClass);
        console.log(`🎯 Set default filter class: ${defaultFilterClass}`);
      }
    } catch (error) {
      console.warn('Could not restore filter class from localStorage:', error);
      // Fallback to default
      const defaultFilterClass = `filter-${this.currentIndustry}`;
      document.body.classList.add(defaultFilterClass);
      console.log(`🎯 Set fallback filter class: ${defaultFilterClass}`);
    }
  }

  getInitialIndustry() {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlIndustry = urlParams.get('industry');
    if (urlIndustry && ['dental', 'finance', 'real-estate', 'small-business'].includes(urlIndustry)) {
      return urlIndustry;
    }

    // Check localStorage
    try {
      const saved = localStorage.getItem('brik-industry-theme');
      if (saved && ['dental', 'finance', 'real-estate', 'small-business'].includes(saved)) {
        return saved;
      }
    } catch (error) {
      console.warn('Could not read from localStorage:', error);
    }

    return 'dental'; // Default
  }

  populateInitialContent() {
    console.log(`🎯 Populating initial content for industry: ${this.currentIndustry}`);
    this.hideWebflowEmptyStates();
    this.updateContent(this.currentIndustry);
  }

  hideWebflowEmptyStates() {
    // Hide "No items found" messages
    const emptyStates = document.querySelectorAll('.w-dyn-empty');
    emptyStates.forEach(empty => {
      empty.style.display = 'none';
      console.log('🔇 Hidden empty state:', empty);
    });

    // Show dynamic content containers
    const dynItems = document.querySelectorAll('.w-dyn-items');
    dynItems.forEach(container => {
      container.style.display = 'grid'; // or 'flex' depending on layout
      console.log('👁️ Shown dynamic container:', container);
    });
  }

  updateContent(industry) {
    if (!cmsData[industry]) {
      console.warn(`⚠️ No CMS data found for industry: ${industry}`);
      return;
    }

    console.log(`🔄 Updating content for industry: ${industry}`);
    this.currentIndustry = industry;

    const industryData = cmsData[industry];

    // Update body classes for CSS filtering
    this.updateBodyClasses(industry);

    // Update text content
    this.updateTextContent(industryData);
    
    // Update images
    this.updateImages(industryData);
    
    // Set data-industry attributes on populated elements
    this.setIndustryAttributes(industry);
    
    // Remove w-dyn-bind-empty classes
    this.removeBindEmptyClasses();

    console.log(`✅ Content updated for ${industry}`);
  }

  updateBodyClasses(industry) {
    const body = document.body;
    
    // Remove existing filter classes
    const existingFilterClasses = Array.from(body.classList).filter(cls => cls.startsWith('filter-'));
    existingFilterClasses.forEach(cls => {
      body.classList.remove(cls);
      console.log(`🧹 Removed body class: ${cls}`);
    });
    
    // Add the new filter class
    const filterClass = `filter-${industry}`;
    body.classList.add(filterClass);
    console.log(`🏷️ Added body class: ${filterClass}`);
    
    // Also save to localStorage for persistence
    try {
      localStorage.setItem('brik-industry-filter', filterClass);
    } catch (error) {
      console.warn('Could not save filter class to localStorage:', error);
    }
  }

  updateTextContent(industryData) {
    // Update hero content
    if (industryData.home && industryData.home.hero) {
      this.updateElementsText(contentMappings.hero.title, industryData.home.hero.title);
      this.updateElementsText(contentMappings.hero.description, industryData.home.hero.description);
    }

    // Update about content
    if (industryData.about) {
      this.updateElementsText(contentMappings.about.title, industryData.about.title);
      this.updateElementsText(contentMappings.about.description, industryData.about.description);
    }

    // Update CTA content
    if (industryData.home && industryData.home.cta) {
      this.updateElementsText(contentMappings.cta.title, industryData.home.cta.title);
      this.updateElementsText(contentMappings.cta.description, industryData.home.cta.description);
    }
  }

  updateImages(industryData) {
    if (industryData.home && industryData.home.images) {
      const images = industryData.home.images;
      
      // Update hero images
      if (images.location1) {
        this.updateElementsAttribute(contentMappings.images.hero, 'src', images.location1);
      }
      
      // Update other content images
      if (images.person1) {
        this.updateElementsAttribute(['.content_image img:first-child'], 'src', images.person1);
      }
      if (images.person2) {
        this.updateElementsAttribute(['.content_image img:nth-child(2)'], 'src', images.person2);
      }
    }
  }

  updateElementsText(selectors, text) {
    if (!text) return;
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = text;
        } else {
          el.textContent = text;
        }
        console.log(`📝 Updated text: ${selector}`);
      });
    });
  }

  updateElementsAttribute(selectors, attribute, value) {
    if (!value) return;
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.setAttribute(attribute, value);
        console.log(`🖼️ Updated ${attribute}: ${selector}`);
      });
    });
  }

  setIndustryAttributes(industry) {
    // Set data-industry attributes on all populated content containers
    const contentContainers = [
      '.w-dyn-item',
      '.collection-item',
      '.section_hero',
      '.section_about', 
      '.section_services',
      '.section_cta'
    ];

    contentContainers.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Set data-industry if it doesn't exist or is empty, OR if it's a w-dyn-item (always update these)
        const currentValue = el.getAttribute('data-industry');
        if (!currentValue || currentValue.trim() === '' || el.classList.contains('w-dyn-item')) {
          el.setAttribute('data-industry', industry);
          console.log(`🏷️ Set data-industry="${industry}" on: ${selector} (was: "${currentValue || 'missing'}")`);
        }
      });
    });
  }

  removeBindEmptyClasses() {
    const bindEmptyElements = document.querySelectorAll('.w-dyn-bind-empty');
    bindEmptyElements.forEach(el => {
      el.classList.remove('w-dyn-bind-empty');
      console.log('🧹 Removed w-dyn-bind-empty class');
    });
  }

  // Public methods for debugging
  debugContent() {
    console.log('🐛 CMS Debug Info:');
    console.log('Current industry:', this.currentIndustry);
    console.log('Available data:', Object.keys(cmsData));
    console.log('Is initialized:', this.isInitialized);
    
    // Check body classes
    console.log('Body classes:', Array.from(document.body.classList));
    const expectedFilterClass = `filter-${this.currentIndustry}`;
    const hasCorrectFilter = document.body.classList.contains(expectedFilterClass);
    console.log(`Expected filter class: ${expectedFilterClass}`);
    console.log(`Has correct filter: ${hasCorrectFilter}`);
    
    // Check for empty states
    const emptyStates = document.querySelectorAll('.w-dyn-empty');
    console.log('Empty states found:', emptyStates.length);
    
    // Check for dynamic items
    const dynItems = document.querySelectorAll('.w-dyn-items');
    console.log('Dynamic containers found:', dynItems.length);
    
    // Check for data-industry attributes
    const industryElements = document.querySelectorAll('[data-industry]');
    console.log('Elements with data-industry:', industryElements.length);
    
    // Debug specific hero content
    console.log('\n🎯 Hero Content Debug:');
    const heroTitle = document.querySelector('.section_hero h1.text_display-xl.inverse');
    if (heroTitle) {
      console.log('Hero title found:', heroTitle.textContent);
      console.log('Hero title data-industry:', heroTitle.closest('[data-industry]')?.getAttribute('data-industry'));
    }
    
    const heroDesc = document.querySelector('.section_hero p.text_body-xxl.inverse');
    if (heroDesc) {
      console.log('Hero description found:', heroDesc.textContent.substring(0, 50) + '...');
      console.log('Hero desc data-industry:', heroDesc.closest('[data-industry]')?.getAttribute('data-industry'));
    }
    
    // Debug w-dyn-item elements specifically
    console.log('\n🔄 W-Dyn-Item Debug:');
    const dynItems2 = document.querySelectorAll('.w-dyn-item');
    dynItems2.forEach((item, index) => {
      const isVisible = window.getComputedStyle(item).display !== 'none';
      console.log(`Item ${index}:`, {
        classes: Array.from(item.classList),
        'data-industry': item.getAttribute('data-industry'),
        hasContent: item.textContent.trim().length > 0,
        isVisible: isVisible
      });
    });
    
    // Debug CSS filtering
    console.log('\n🎨 CSS Filtering Debug:');
    const industryContent = document.querySelector('.industry-content');
    if (industryContent) {
      console.log('Industry content container found');
      const dataIndustryItems = industryContent.querySelectorAll('[data-industry]');
      console.log(`Items with data-industry in industry-content: ${dataIndustryItems.length}`);
      dataIndustryItems.forEach((item, index) => {
        const isVisible = window.getComputedStyle(item).display !== 'none';
        console.log(`Industry item ${index}: data-industry="${item.getAttribute('data-industry')}", visible: ${isVisible}`);
      });
    }
  }

  forceUpdate(industry = null) {
    const targetIndustry = industry || this.currentIndustry;
    console.log(`🔄 Force updating content for: ${targetIndustry}`);
    this.hideWebflowEmptyStates();
    this.updateContent(targetIndustry);
  }

  // New method to force refresh everything
  forceRefresh(industry = null) {
    const targetIndustry = industry || this.currentIndustry;
    console.log(`🔄🔄 Force refreshing EVERYTHING for: ${targetIndustry}`);
    
    // Reset all data-industry attributes first
    const existingElements = document.querySelectorAll('[data-industry]');
    existingElements.forEach(el => {
      el.setAttribute('data-industry', targetIndustry);
    });
    
    this.hideWebflowEmptyStates();
    this.updateContent(targetIndustry);
    
    // Double-check data-industry attributes after update
    setTimeout(() => {
      const dynItems = document.querySelectorAll('.w-dyn-item');
      dynItems.forEach(item => {
        if (!item.getAttribute('data-industry') || item.getAttribute('data-industry').trim() === '') {
          item.setAttribute('data-industry', targetIndustry);
          console.log('🔧 Fixed empty data-industry attribute on:', item);
        }
      });
    }, 100);
  }
}

// Initialize the enhanced CMS system
const enhancedCMS = new EnhancedCMSSystem();

// Expose for debugging
window.enhancedCMS = enhancedCMS;
window.cmsDebug = () => enhancedCMS.debugContent();
window.cmsUpdate = (industry) => enhancedCMS.forceUpdate(industry);
window.cmsRefresh = (industry) => enhancedCMS.forceRefresh(industry);

console.log('🎯 Enhanced CMS Content System loaded!');
console.log('💡 Debug commands: cmsDebug(), cmsUpdate("dental"), cmsRefresh("dental")');


