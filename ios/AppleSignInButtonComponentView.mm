#import "AppleSignInButtonComponentView.h"

#import <AuthenticationServices/AuthenticationServices.h>

#import <react/renderer/components/ReactNativeSocialAuthSpec/ComponentDescriptors.h>
#import <react/renderer/components/ReactNativeSocialAuthSpec/EventEmitters.h>
#import <react/renderer/components/ReactNativeSocialAuthSpec/Props.h>
#import <react/renderer/components/ReactNativeSocialAuthSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface AppleSignInButtonComponentView () <RCTAppleSignInButtonViewProtocol>
@end

@implementation AppleSignInButtonComponentView {
  ASAuthorizationAppleIDButton *_button;
  NSInteger _buttonType;
  NSInteger _buttonStyle;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<AppleSignInButtonComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const AppleSignInButtonProps>();
    _props = defaultProps;
    _buttonType = defaultProps->buttonType;
    _buttonStyle = defaultProps->buttonStyle;
    [self rebuildButton];
  }
  return self;
}

- (void)rebuildButton {
  if (_button != nil) {
    [_button removeFromSuperview];
  }

  _button = [[ASAuthorizationAppleIDButton alloc]
      initWithAuthorizationButtonType:(ASAuthorizationAppleIDButtonType)_buttonType
              authorizationButtonStyle:(ASAuthorizationAppleIDButtonStyle)_buttonStyle];
  _button.translatesAutoresizingMaskIntoConstraints = NO;
  [_button addTarget:self
                action:@selector(didTapButton)
      forControlEvents:UIControlEventTouchUpInside];
  [self addSubview:_button];

  [NSLayoutConstraint activateConstraints:@[
    [_button.topAnchor constraintEqualToAnchor:self.topAnchor],
    [_button.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
    [_button.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
    [_button.trailingAnchor constraintEqualToAnchor:self.trailingAnchor],
  ]];
}

- (void)didTapButton {
  if (_eventEmitter == nullptr) {
    return;
  }
  std::static_pointer_cast<const AppleSignInButtonEventEmitter>(_eventEmitter)
      ->onButtonPress(AppleSignInButtonEventEmitter::OnButtonPress{});
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = *std::static_pointer_cast<const AppleSignInButtonProps>(props);

  // ASAuthorizationAppleIDButton's type and style are init-only, so recreate
  // the button when either changes.
  if (newProps.buttonType != _buttonType || newProps.buttonStyle != _buttonStyle) {
    _buttonType = newProps.buttonType;
    _buttonStyle = newProps.buttonStyle;
    [self rebuildButton];
  }

  if (newProps.cornerRadius >= 0) {
    _button.cornerRadius = newProps.cornerRadius;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle {
  [super prepareForRecycle];
  _buttonType = 0;
  _buttonStyle = 2;
  [self rebuildButton];
}

@end
