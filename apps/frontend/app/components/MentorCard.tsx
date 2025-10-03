'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { MentorProps } from '../types/mentor';
import GithubIcon from './icons/GithubIcon';
import LinkIcon from './icons/LinkIcon';
import LinkedinIcon from './icons/LinkedinIcon';
import XIcon from './icons/XIcon';

export default function MentorCard({ name, role, image, bio, expertise, social }: MentorProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isHovered ? '0 10px 30px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="relative h-80 w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s ease',
          }}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-85'
          }`}
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
            <p className="text-white/80 text-sm">{role}</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-grow">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{bio}</p>

        <div>
          <div className="flex flex-wrap gap-2">
            {expertise.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                style={{
                  transform: isHovered ? 'translateY(0)' : 'translateY(0)',
                  opacity: isHovered ? 1 : 0.9,
                  transition: `transform 0.3s ease ${
                    0.1 + index * 0.05
                  }s, opacity 0.3s ease ${0.1 + index * 0.05}s`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0 mt-auto">
        <div className="flex space-x-3">
          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors duration-300"
              aria-label="GitHub Profile"
            >
              <GithubIcon />
            </a>
          )}
          {social.twitter && (
            <a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors duration-300"
              aria-label="X (Twitter) Profile"
            >
              <XIcon />
            </a>
          )}
          {social.linkedin && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors duration-300"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon />
            </a>
          )}
          {social.website && (
            <a
              href={social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors duration-300"
              aria-label="Personal Website"
            >
              <LinkIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
