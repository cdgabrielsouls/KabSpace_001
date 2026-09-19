const schoolEmailPattern = /^[a-z]+\.[a-z]+@cvsu\.edu\.ph$/i

export function isSchoolEmail(email: string) {
  return schoolEmailPattern.test(email.trim())
}

export const schoolEmailMessage = 'Use your firstname.lastname@cvsu.edu.ph school email.'