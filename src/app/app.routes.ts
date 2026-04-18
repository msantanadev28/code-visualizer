import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./features/visualizer/visualizer-page.component').then(
				(module) => module.VisualizerPageComponent
			)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
