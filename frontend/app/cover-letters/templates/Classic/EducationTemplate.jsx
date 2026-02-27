import { getFontClass } from "@/app/utils/font";

const EducationTemplate = ({ coverLetterData = {}, font = 'Georgia' }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = '',
    closing = {}
  } = coverLetterData;

  const {
    full_name = '[Your Name]',
    email,
    phone_number,
    linkedin,
    credentials,
    title
  } = profile;

  const {
    company_name = '[School Name]',
    job_title = '[Position]',
    hiring_manager_name = '[Hiring Manager]'
  } = recipient;
  const selectedFont = getFontClass(font);

  return (
    <div
      className={`max-w-2xl mx-auto p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 text-gray-900 ${font}`}
      style={{ fontFamily: selectedFont }}
    >
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-4 border-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 bg-clip-border rounded-lg">
        <div className="bg-white p-6 rounded-lg border-4 border-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 bg-clip-border">
          <div className="bg-white p-4 rounded-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-lime-600 bg-clip-text text-transparent mb-2">
              {full_name}
            </h1>
            {title && (
              <div className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
                {title}
              </div>
            )}
            {credentials && (
              <div className="text-xs text-green-700 mb-3 italic">{credentials}</div>
            )}
            <div className="text-sm text-gray-600 space-y-1">
              {email && <div>📧 {email}</div>}
              {phone_number && <div>📞 {phone_number}</div>}
              {linkedin && <div>💼 {linkedin}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Date & Recipient */}
      <div className="mb-6 text-sm text-gray-700 bg-white p-4 rounded-lg shadow-md">
        
        <div className="mb-4">
          <div className="font-semibold">{hiring_manager_name}</div>
          <p className="text-gray-600">{job_title}</p>
          <div>{company_name}</div>
        </div>
      </div>

      {/* Salutation */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <p className="text-gray-900">
          {introduction.greet_text || `Dear ${hiring_manager_name || company_name},`}
        </p>
      </div>

      {/* Introduction */}
      {introduction.intro_para && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border-l-6 border-green-500">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📚</div>
            <p className="text-gray-700 leading-relaxed">{introduction.intro_para}</p>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="space-y-6 mb-6">
        {body ? (
          <div
            className="p-6 bg-white rounded-lg shadow-lg border-l-6 border-emerald-500 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <div className="p-6 bg-white rounded-lg shadow-lg border-l-6 border-emerald-500 text-gray-700">
            <p>
              [Your teaching experience, student achievements, and educational philosophy go here.]
            </p>
          </div>
        )}
      </div>

      {/* Closing */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border-l-6 border-green-500">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎓</div>
          <p className="text-gray-700 leading-relaxed">
            {closing.text || `I would be honored to bring my passion for teaching and commitment to student success to ${company_name}.`}
          </p>
        </div>
      </div>

      {/* Signature */}
      <div className="text-right bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <p className="text-gray-900">Sincerely,</p>
        </div>
        <div className="font-bold text-lg bg-gradient-to-r from-green-700 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
          {full_name}
        </div>
        {credentials && (
          <div className="text-sm text-gray-600 mt-2 italic">{credentials}</div>
        )}
      </div>
    </div>
  );
};

export default EducationTemplate;
