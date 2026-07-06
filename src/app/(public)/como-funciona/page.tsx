import { FaqAccordion } from '@/features/onboarding/components/faq-accordion'

export const metadata = {
  title: '¿Cómo funciona? - PsicoAyuda VE',
  description: 'Guía rápida sobre cómo funciona PsicoAyuda VE, el directorio de psicólogos voluntarios.',
}

const faqItems = [
  {
    question: '¿Qué es PsicoAyuda VE?',
    answer: 'PsicoAyuda VE es un directorio gratuito que conecta a personas que necesitan apoyo psicológico con psicólogos voluntarios. La plataforma facilita el primer contacto; la atención ocurre fuera de la plataforma, a través de WhatsApp.',
  },
  {
    question: '¿Cómo solicito ayuda?',
    answer: 'Es muy simple: 1) Regístrate con tu correo electrónico. 2) Explora nuestro catálogo de psicólogos y elige con quién te gustaría hablar. 3) Envía una solicitud de cita explicando brevemente tu motivo. El psicólogo recibirá tu solicitud y la aceptará o rechazará.',
  },
  {
    question: '¿Qué pasa después de enviar mi solicitud?',
    answer: 'Cuando envías una solicitud, el psicólogo la recibe y la revisa. Si la acepta, recibirás una notificación y podrás ver su enlace de WhatsApp para contactarlo directamente. Si la rechaza, recibirás una notificación y podrás intentar con otro psicólogo.',
  },
  {
    question: '¿Es confidencial?',
    answer: 'Sí, la información que compartes en la plataforma es privada. Solo el psicólogo al que solicitas cita puede ver los datos que proporcionas. La plataforma no almacena conversaciones de WhatsApp ni datos clínicos. Al enviar una solicitud, aceptas nuestros términos de consentimiento.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer: 'PsicoAyuda VE es completamente gratuito. Los psicólogos que aparecen en el directorio son voluntarios. No realizamos ningún cobro por el uso de la plataforma ni por las consultas.',
  },
  {
    question: '¿Quiero ser voluntario?',
    answer: 'Si eres psicólogo titulado y quieres sumarte como voluntario, solo tienes que registrarte en la plataforma. Un administrador verificará tu información y, una vez aprobado, aparecerás en el catálogo para que los pacientes puedan solicitarte cita.',
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold text-foreground mb-2">¿Cómo funciona?</h1>
      <p className="text-muted-foreground mb-10">
        Todo lo que necesitas saber para usar PsicoAyuda VE.
      </p>
      <FaqAccordion items={faqItems} />
    </div>
  )
}
