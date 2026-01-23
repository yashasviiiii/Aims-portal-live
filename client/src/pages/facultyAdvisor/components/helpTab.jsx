import React from 'react';

const HelpTab = ({}) => {
    return(
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
              Help Desk
            </h2>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-gray-700 mb-2 font-medium">
                For technical issues or other queries, please contact:
              </p>
              <p className="text-xl">
                <span className="text-gray-500 mr-2">Email:</span>
                <a href="mailto:aims_help@iitrpr.ac.in" className="font-mono font-bold text-blue-600 hover:underline">
                  aims_help@iitrpr.ac.in
                </a>
              </p>
            </div>
          </div>
        );
    };

export default HelpTab;