enum EventType {
	CREATED = 'created',
	BREAKPOINT_CHANGE = 'change',
	ORIENTATION_CHANGE = 'orientationchange',
	RESIZE = 'resize',
	OPTIONS_CHANGED = 'optionsChanged',
	UPDATED = 'updated',
	BEFORE_OPTIONS_CHANGED = 'beforeOptionsChanged',
	DETAILS_CHANGED = 'detailsChanged',
	SLIDE_CHANGED = 'slideChanged',
	ANIMATION_STARTED = 'animationStarted',
	ANIMATION_ENDED = 'animationEnded',
	ANIMATION_STOPPED = 'animationStopped',
	DESTROYED = 'destroyed',
	DRAG_STARTED = 'dragStarted',
	DRAG_ENDED = 'dragEnded',
	DRAG_CHECKED = 'dragChecked',
	DRAGGED = 'dragged',
}

export default EventType;
