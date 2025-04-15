import React from 'react';
import { FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';

const ContactInfo = () => {
  const contacts = [
    {
      title: 'Finance',
      email: 'carmen@swish.co.za',
      icon: <FaEnvelope className="w-5 h-5" />
    },
    {
      title: 'Management',
      email: 'obsadmin@mydomainliving.co.za',
      icon: <FaEnvelope className="w-5 h-5" />
    },
    {
      title: 'Onsite Building Manager',
      phone: '078 355 3314',
      icon: <FaPhone className="w-5 h-5" />
    },
    {
      title: 'Technical Support',
      phone: '078 757 8408',
      icon: <FaGlobe className="w-5 h-5" />
    },
    {
      title: 'Security',
      phone: '068 204 0814',
      icon: <FaPhone className="w-5 h-5" />
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h2>
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="text-blue-600 mt-1">
              {contact.icon}
            </div>
            <div>
              <h3 className="font-medium text-gray-700">{contact.title}</h3>
              {contact.email ? (
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {contact.email}
                </a>
              ) : (
                <a 
                  href={`tel:${contact.phone}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {contact.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfo; 