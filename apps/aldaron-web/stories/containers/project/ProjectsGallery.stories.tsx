import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProjectsGalleryComponent from '@/containers/project/ProjectsGallery';
import { PROJECTS } from '@/utils/project.constants';

const meta = {
  title: 'Containers/Project/ProjectsGallery',
  component: ProjectsGalleryComponent,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { projects: PROJECTS },
} satisfies Meta<typeof ProjectsGalleryComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectsGallery: Story = {};

export const OnePage: Story = { args: { projects: PROJECTS.slice(0, 3) } };
