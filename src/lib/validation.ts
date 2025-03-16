import { Shortcut } from '../types';

export function validateShortcut(shortcut: Partial<Shortcut>): string | null {
  if (!shortcut.shortcut?.trim()) {
    return 'Shortcut is required';
  }
  if (!shortcut.meaning?.trim()) {
    return 'Meaning is required';
  }
  if (shortcut.shortcut.length > 50) {
    return 'Shortcut must be less than 50 characters';
  }
  if (shortcut.meaning.length > 500) {
    return 'Meaning must be less than 500 characters';
  }
  return null;
}

export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}