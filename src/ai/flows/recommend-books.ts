// RecommendBooks flow provides personalized book recommendations based on a user's reading history and current checkouts.
// - recommendBooks - A function that generates book recommendations.
// - RecommendBooksInput - The input type for the recommendBooks function.
// - RecommendBooksOutput - The return type for the recommendBooks function.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendBooksInputSchema = z.object({
  readingHistory: z.array(
    z.string().describe('Titles of books the user has previously read.')
  ).optional().describe('The user reading history as an array of book titles.'),
  currentCheckouts: z.array(
    z.string().describe('Titles of books the user currently has checked out.')
  ).optional().describe('The user current checkouts as an array of book titles.'),
  inventory: z.array(
    z.string().describe('Titles of books currently in inventory.')
  ).optional().describe('The library inventory as an array of book titles.'),
});
export type RecommendBooksInput = z.infer<typeof RecommendBooksInputSchema>;

const RecommendBooksOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('Recommended book titles based on reading history and current checkouts.')
  ).describe('A list of recommended book titles.'),
});
export type RecommendBooksOutput = z.infer<typeof RecommendBooksOutputSchema>;

export async function recommendBooks(input: RecommendBooksInput): Promise<RecommendBooksOutput> {
  return recommendBooksFlow(input);
}

const recommendBooksPrompt = ai.definePrompt({
  name: 'recommendBooksPrompt',
  input: {schema: RecommendBooksInputSchema},
  output: {schema: RecommendBooksOutputSchema},
  prompt: `You are a librarian providing book recommendations.

  Based on the user's reading history: {{#if readingHistory}}{{{readingHistory}}}{{else}}No reading history available.{{/if}}
  and current checkouts: {{#if currentCheckouts}}{{{currentCheckouts}}}{{else}}No current checkouts.{{/if}}
  and the library inventory: {{#if inventory}}{{{inventory}}}{{else}}No inventory available.{{/if}}
  Recommend books that the user might enjoy.
  Return ONLY book titles in a JSON array.
  Make sure you only recommend books currently in the inventory.
  `,
});

const recommendBooksFlow = ai.defineFlow(
  {
    name: 'recommendBooksFlow',
    inputSchema: RecommendBooksInputSchema,
    outputSchema: RecommendBooksOutputSchema,
  },
  async input => {
    const {output} = await recommendBooksPrompt(input);
    return output!;
  }
);
