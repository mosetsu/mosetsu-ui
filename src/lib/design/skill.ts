import skillMd from '$lib/design/mcp-skill.md?raw';
import { MODULES, getDefaultMetrics } from '$lib/modules';

/**
 * The AI skill text shown in the Upload dialog. The narrative lives in
 * `mcp-skill.md` (maintained by hand as features change); the module reference
 * — every module's metrics with their label, unit, default value, and which
 * metric represents capacity — is injected live from the registry so it is
 * always complete and never goes stale.
 */
function moduleReference(): string {
	return Object.values(MODULES)
		.map((d) => {
			const defaults = getDefaultMetrics(d.type);
			const metricLines = d.metrics
				.map((mm) => {
					const unit = mm.unit ? ` ${mm.unit}` : '';
					const def = defaults[mm.key];
					const cap = mm.key === d.throughputField ? '  ← capacity' : '';
					return `    • ${mm.key}: ${mm.label}${unit ? ` — ${unit.trim()}` : ''} (default ${def})${cap}`;
				})
				.join('\n');
			const sub = d.subtitle ? ` — ${d.subtitle}` : '';
			return `● ${d.type}${sub}  [${d.category}]\n${metricLines}`;
		})
		.join('\n\n');
}

export function buildSkillText(): string {
	return skillMd.replace('{{MODULES}}', moduleReference());
}
