/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CardItem {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameStatus = 'HOME' | 'PLAYING' | 'WON' | 'LOST';
